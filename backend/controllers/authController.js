const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { createTokenPair, hashToken } = require("../utils/tokens");
const { cloudinary, uploadBuffer } = require("../utils/cloudinary");
const {
    isValidEmail,
    isStrongPassword,
    validateStudentRegistration,
    validateFacultyRegistration
} = require("../utils/validators");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files are allowed."));
            return;
        }
        cb(null, true);
    }
});

const publicUserFields = "-password -emailVerificationToken -passwordResetToken";

const signToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

const clientUrl = () => process.env.CLIENT_URL || "http://localhost:5173";

const sendVerificationEmail = async (user) => {
    const { token, hashedToken } = createTokenPair();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const link = `${clientUrl()}/verify-email/${token}`;
    await sendEmail({
        to: user.email,
        subject: "Verify your campus canteen account",
        html: `<p>Hello ${user.fullName},</p><p>Please verify your email to activate your campus canteen account.</p><p><a href="${link}">Verify Email</a></p><p>This link expires in 24 hours.</p>`
    });
};

const registerStudent = async (req, res) => {
    try {
        const errors = validateStudentRegistration(req.body);
        if (errors.length) return res.status(400).json({ message: errors[0], errors });

        const email = req.body.email.trim().toLowerCase();
        const existing = await User.findOne({ $or: [{ email }, { ucid: req.body.ucid }] });
        if (existing) return res.status(409).json({ message: "Email or UCID already exists." });

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            role: "student",
            fullName: req.body.fullName.trim(),
            ucid: req.body.ucid,
            email,
            password: hashedPassword,
            gender: req.body.gender,
            branch: req.body.branch,
            className: req.body.className,
            division: req.body.division
        });

        await sendVerificationEmail(user);
        res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
    } catch (error) {
        res.status(500).json({ message: "Student registration failed." , error: error.message });
    }
};

const registerFaculty = async (req, res) => {
    try {
        const errors = validateFacultyRegistration(req.body);
        if (errors.length) return res.status(400).json({ message: errors[0], errors });

        const email = req.body.email.trim().toLowerCase();
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: "Email already exists." });

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            role: "faculty",
            fullName: req.body.fullName.trim(),
            email,
            password: hashedPassword,
            gender: req.body.gender,
            branch: req.body.branch,
            designation: req.body.designation.trim()
        });

        await sendVerificationEmail(user);
        res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
    } catch (error) {
        res.status(500).json({ message: "Faculty registration failed.", error: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({
            emailVerificationToken: hashToken(req.params.token),
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!user) return res.status(400).json({ message: "Verification link is invalid or expired." });

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ message: "Email verified successfully." });
    } catch (error) {
        res.status(500).json({ message: "Email verification failed.", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!isValidEmail(email) || !password) return res.status(400).json({ message: "Enter a valid email and password." });

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return res.status(401).json({ message: "Invalid email or password." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });
        if (user.isActive === false) return res.status(403).json({ message: "Your account has been disabled. Contact the administrator." });
        if (!user.isVerified) return res.status(403).json({ message: "Please verify your email before logging in." });

        const safeUser = await User.findById(user._id).select(publicUserFields);
        res.json({ message: "Login successful.", token: signToken(user), user: safeUser });
    } catch (error) {
        res.status(500).json({ message: "Login failed.", error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!isValidEmail(email)) return res.status(400).json({ message: "Enter a valid email address." });

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (user) {
            const { token, hashedToken } = createTokenPair();
            user.passwordResetToken = hashedToken;
            user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
            await user.save();

            const link = `${clientUrl()}/reset-password/${token}`;
            await sendEmail({
                to: user.email,
                subject: "Reset your campus canteen password",
                html: `<p>Hello ${user.fullName},</p><p>Use the link below to reset your password.</p><p><a href="${link}">Reset Password</a></p><p>This link expires in 1 hour.</p>`
            });
        }

        res.json({ message: "If the email exists, a reset link has been sent." });
    } catch (error) {
        res.status(500).json({ message: "Forgot password failed.", error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        if (!isStrongPassword(password)) return res.status(400).json({ message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character." });
        if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });

        const user = await User.findOne({
            passwordResetToken: hashToken(req.params.token),
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) return res.status(400).json({ message: "Reset link is invalid or expired." });

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful. You can now log in." });
    } catch (error) {
        res.status(500).json({ message: "Reset password failed.", error: error.message });
    }
};

const getProfile = async (req, res) => {
    res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
    try {
        const allowed = ["fullName", "gender", "branch", "className", "division", "designation"];
        const updates = {};

        allowed.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const removeProfilePic = req.body.removeProfilePic === "true" || req.body.removeProfilePic === true;
        const hasExistingProfilePic = Boolean(req.user.profilePicPublicId || req.user.profilePic);

        if (removeProfilePic) {
            updates.profilePic = undefined;
            updates.profilePicPublicId = undefined;

            if (req.user.profilePicPublicId) {
                await cloudinary.uploader.destroy(req.user.profilePicPublicId);
            }
        } else if (req.file) {
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                return res.status(500).json({ message: "Cloudinary environment variables are not configured." });
            }

            const result = await uploadBuffer(req.file.buffer, "campus-canteen/profiles");
            updates.profilePic = result.secure_url;
            updates.profilePicPublicId = result.public_id;

            if (req.user.profilePicPublicId) {
                await cloudinary.uploader.destroy(req.user.profilePicPublicId);
            }
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found." });

        Object.entries(updates).forEach(([key, value]) => {
            user[key] = value;
        });

        if (removeProfilePic) {
            user.profilePic = undefined;
            user.profilePicPublicId = undefined;
        }

        await user.save();
        const safeUser = await User.findById(user._id).select(publicUserFields);

        if (removeProfilePic && !hasExistingProfilePic) {
            return res.json({ message: "No profile picture to remove.", user: safeUser });
        }

        res.json({ message: removeProfilePic ? "Profile picture removed successfully." : "Profile updated successfully.", user: safeUser });
    } catch (error) {
        res.status(500).json({ message: "Profile update failed.", error: error.message });
    }
};

module.exports = {
    upload,
    registerStudent,
    registerFaculty,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile
};

