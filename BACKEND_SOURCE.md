# Backend Overview

Campus Canteen System backend built with Express, MongoDB, authentication, menu, cart, order, notification, and admin APIs.

# Folder Structure

backend/
config/
controllers/
middleware/
models/
routes/
utils/
seeds/
server.js
package.json
.env.example

## backend/server.js

```js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5000;
let server;
let shuttingDown = false;

const shutdown = async (reason, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${reason} received. Shutting down gracefully.`);

    try {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
            console.log("HTTP server closed.");
        }

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("MongoDB connection closed.");
        }
    } catch (error) {
        console.error("Error during shutdown:", error);
    } finally {
        process.exit(exitCode);
    }
};

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    void shutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
    void shutdown("unhandledRejection", 1);
});

const startServer = async () => {
    await connectDB();

    server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "development" ? 300 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." }
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({ success: true, message: "Campus Canteen API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

process.on("SIGTERM", () => {
    void shutdown("SIGTERM", 0);
});

process.on("SIGINT", () => {
    void shutdown("SIGINT", 0);
});

void startServer();

```

## backend/config/db.js

```js
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

## backend/controllers/adminController.js

```js
﻿const mongoose = require("mongoose");
const multer = require("multer");
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const User = require("../models/User");
const { uploadBuffer } = require("../utils/cloudinary");
const { orderPreparingEmail, orderReadyEmail } = require("../utils/emailTemplates");
const sendEmail = require("../utils/sendEmail");

const STATUS_TRANSITIONS = { Received: "Preparing", Preparing: "Ready To Pick Up" };
const menuCategories = ["Veg", "Non Veg", "Snacks", "Drinks"];
const publicUserFields = "-password -emailVerificationToken -passwordResetToken";
const orderUserFields = "fullName email role ucid branch className division designation profilePic";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 4 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed."));
        cb(null, true);
    }
});

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalStudents, totalFaculty, totalOrders, receivedOrders, preparingOrders, readyOrders, menuItems] = await Promise.all([
            User.countDocuments({ role: { $in: ["student", "faculty"] } }),
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "faculty" }),
            Order.countDocuments(),
            Order.countDocuments({ status: "Received" }),
            Order.countDocuments({ status: "Preparing" }),
            Order.countDocuments({ status: "Ready To Pick Up" }),
            MenuItem.countDocuments()
        ]);
        res.json({ stats: { totalUsers, totalStudents, totalFaculty, totalOrders, receivedOrders, preparingOrders, readyOrders, menuItems } });
    } catch (error) {
        res.status(500).json({ message: "Failed to load dashboard statistics.", error: error.message });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const trendStart = new Date(startOfToday);
        trendStart.setDate(startOfToday.getDate() - 13);

        const [summaryResult, revenueTrend, ordersTrend, topItems, categoryDistribution, topCustomers, statusDistribution] = await Promise.all([
            Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" },
                        totalOrders: { $sum: 1 },
                        revenueToday: { $sum: { $cond: [{ $gte: ["$createdAt", startOfToday] }, "$totalAmount", 0] } },
                        revenueWeek: { $sum: { $cond: [{ $gte: ["$createdAt", startOfWeek] }, "$totalAmount", 0] } },
                        revenueMonth: { $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$totalAmount", 0] } },
                        ordersToday: { $sum: { $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0] } },
                        ordersWeek: { $sum: { $cond: [{ $gte: ["$createdAt", startOfWeek] }, 1, 0] } },
                        ordersMonth: { $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0] } }
                    }
                }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: trendStart } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" } } },
                { $project: { _id: 0, date: "$_id", revenue: 1 } },
                { $sort: { date: 1 } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: trendStart } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders: { $sum: 1 } } },
                { $project: { _id: 0, date: "$_id", orders: 1 } },
                { $sort: { date: 1 } }
            ]),
            Order.aggregate([
                { $unwind: "$items" },
                { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" }, revenue: { $sum: "$items.subtotal" } } },
                { $project: { _id: 0, name: "$_id", quantity: 1, revenue: 1 } },
                { $sort: { quantity: -1, revenue: -1 } },
                { $limit: 8 }
            ]),
            Order.aggregate([
                { $unwind: "$items" },
                { $lookup: { from: "menuitems", localField: "items.menuItem", foreignField: "_id", as: "menuItem" } },
                { $unwind: { path: "$menuItem", preserveNullAndEmptyArrays: true } },
                { $group: { _id: { $ifNull: ["$menuItem.category", "Uncategorized"] }, quantity: { $sum: "$items.quantity" }, revenue: { $sum: "$items.subtotal" } } },
                { $project: { _id: 0, category: "$_id", quantity: 1, revenue: 1 } },
                { $sort: { quantity: -1 } }
            ]),
            Order.aggregate([
                { $group: { _id: "$user", orders: { $sum: 1 }, totalSpend: { $sum: "$totalAmount" } } },
                { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
                { $unwind: "$user" },
                { $project: { _id: 0, userId: "$_id", fullName: "$user.fullName", email: "$user.email", role: "$user.role", orders: 1, totalSpend: 1 } },
                { $sort: { totalSpend: -1, orders: -1 } },
                { $limit: 6 }
            ]),
            Order.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $project: { _id: 0, status: "$_id", count: 1 } },
                { $sort: { status: 1 } }
            ])
        ]);

        const summary = summaryResult[0] || {};
        res.json({
            analytics: {
                revenue: {
                    total: summary.totalRevenue || 0,
                    today: summary.revenueToday || 0,
                    week: summary.revenueWeek || 0,
                    month: summary.revenueMonth || 0
                },
                orders: {
                    total: summary.totalOrders || 0,
                    today: summary.ordersToday || 0,
                    week: summary.ordersWeek || 0,
                    month: summary.ordersMonth || 0
                },
                revenueTrend,
                ordersTrend,
                topItems,
                topCustomers,
                categoryDistribution,
                statusDistribution
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load analytics.", error: error.message });
    }
};

const getAdminOrders = async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;
        const orders = await Order.find(query).populate("user", orderUserFields).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Failed to load orders.", error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order id." });
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found." });

        const nextStatus = req.body.status;
        if (STATUS_TRANSITIONS[order.status] !== nextStatus) {
            return res.status(400).json({ message: `Order can only move from ${order.status} to ${STATUS_TRANSITIONS[order.status] || "no further status"}.` });
        }

        order.status = nextStatus;
        await order.save();
        await order.populate("user", orderUserFields);
        await Notification.create({
            user: order.user._id,
            title: nextStatus === "Preparing" ? "Order preparing" : "Order ready",
            message: nextStatus === "Preparing"
                ? `${order.orderNumber} is now being prepared.`
                : `${order.orderNumber} is ready to pick up.`,
            type: nextStatus === "Preparing" ? "order_preparing" : "order_ready"
        }).catch((error) => console.error("Notification creation failed:", error.message));
        const email = nextStatus === "Preparing" ? orderPreparingEmail(order) : orderReadyEmail(order);
        sendEmail({ to: order.user.email, ...email }).catch((error) => console.error("Order status email failed:", error.message));
        res.json({ message: "Order status updated.", order });
    } catch (error) {
        res.status(500).json({ message: "Failed to update order status.", error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const query = { role: { $in: ["student", "faculty"] } };
        if (["student", "faculty"].includes(req.query.role)) query.role = req.query.role;
        if (req.query.search) {
            const pattern = new RegExp(escapeRegex(req.query.search.trim()), "i");
            query.$or = [{ fullName: pattern }, { email: pattern }, { ucid: pattern }];
        }
        const users = await User.find(query).select(publicUserFields).sort({ role: 1, fullName: 1 });
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: "Failed to load users.", error: error.message });
    }
};

const toggleUser = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid user id." });
        const user = await User.findOne({ _id: req.params.id, role: { $in: ["student", "faculty"] } }).select(publicUserFields);
        if (!user) return res.status(404).json({ message: "User not found." });
        user.isActive = user.isActive === false;
        await user.save();
        res.json({ message: `User ${user.isActive ? "enabled" : "disabled"}.`, user });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user.", error: error.message });
    }
};

const validateMenuInput = (body, requireAll = true) => {
    const errors = [];
    if (requireAll && !body.name?.trim()) errors.push("Name is required.");
    if (requireAll && !body.description?.trim()) errors.push("Description is required.");
    if (body.category !== undefined && !menuCategories.includes(body.category)) errors.push("Select a valid category.");
    if (body.price !== undefined) {
        const price = Number(body.price);
        if (!Number.isFinite(price) || price < 0) errors.push("Price must be a non-negative number.");
    } else if (requireAll) errors.push("Price is required.");
    return errors;
};

const getAdminMenu = async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ category: 1, name: 1 });
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: "Failed to load menu.", error: error.message });
    }
};

const createMenuItem = async (req, res) => {
    try {
        const errors = validateMenuInput(req.body);
        if (errors.length) return res.status(400).json({ message: errors[0], errors });
        if (!req.file && !req.body.imageUrl) return res.status(400).json({ message: "Dish image is required." });

        let imageUrl = req.body.imageUrl;
        if (req.file) imageUrl = (await uploadBuffer(req.file.buffer, "campus-canteen/menu")).secure_url;
        const item = await MenuItem.create({
            name: req.body.name.trim(),
            description: req.body.description.trim(),
            category: req.body.category,
            price: Number(req.body.price),
            imageUrl,
            available: req.body.available === undefined ? true : req.body.available === "true" || req.body.available === true
        });
        res.status(201).json({ message: "Dish created.", item });
    } catch (error) {
        res.status(500).json({ message: "Failed to create dish.", error: error.message });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid menu item id." });
        const errors = validateMenuInput(req.body, false);
        if (errors.length) return res.status(400).json({ message: errors[0], errors });
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Menu item not found." });

        ["name", "description", "category"].forEach((field) => {
            if (req.body[field] !== undefined) item[field] = req.body[field].trim();
        });
        if (req.body.price !== undefined) item.price = Number(req.body.price);
        if (req.body.available !== undefined) item.available = req.body.available === "true" || req.body.available === true;
        if (req.body.imageUrl) item.imageUrl = req.body.imageUrl;
        if (req.file) item.imageUrl = (await uploadBuffer(req.file.buffer, "campus-canteen/menu")).secure_url;
        await item.save();
        res.json({ message: "Dish updated.", item });
    } catch (error) {
        res.status(500).json({ message: "Failed to update dish.", error: error.message });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid menu item id." });
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Menu item not found." });
        await Cart.updateMany({}, { $pull: { items: { menuItem: item._id } } });
        res.json({ message: "Dish deleted." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete dish.", error: error.message });
    }
};

module.exports = { upload, getDashboardStats, getAnalytics, getAdminOrders, updateOrderStatus, getUsers, toggleUser, getAdminMenu, createMenuItem, updateMenuItem, deleteMenuItem };



```

## backend/controllers/authController.js

```js
﻿const bcrypt = require("bcryptjs");
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
        res.status(500).json({ message: "Student registration failed.", error: error.message });
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

        if (req.file) {
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

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select(publicUserFields);
        res.json({ message: "Profile updated successfully.", user });
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






```

## backend/controllers/cartController.js

```js
﻿const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");

const MAX_QUANTITY = 6;

const populateCart = (query) => query.populate("items.menuItem");

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    return cart;
};

const formatCart = (cart) => {
    const items = cart.items.filter((item) => item.menuItem).map((item) => ({
        menuItem: item.menuItem,
        quantity: item.quantity,
        itemTotal: item.quantity * item.menuItem.price
    }));

    const total = items.reduce((sum, item) => sum + item.itemTotal, 0);

    return { _id: cart._id, user: cart.user, items, total };
};

const getCart = async (req, res) => {
    try {
        await getOrCreateCart(req.user._id);
        const cart = await populateCart(Cart.findOne({ user: req.user._id }));
        res.json({ cart: formatCart(cart) });
    } catch (error) {
        res.status(500).json({ message: "Failed to load cart.", error: error.message });
    }
};

const addToCart = async (req, res) => {
    try {
        const { menuItemId, quantity = 1 } = req.body;
        const requestedQuantity = Number(quantity);

        if (!menuItemId) return res.status(400).json({ message: "Menu item is required." });
        if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) return res.status(400).json({ message: "Quantity must be at least 1." });

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) return res.status(404).json({ message: "Menu item not found." });
        if (!menuItem.available) return res.status(400).json({ message: "This item is currently unavailable." });

        const cart = await getOrCreateCart(req.user._id);
        const existing = cart.items.find((item) => item.menuItem.toString() === menuItemId);
        const nextQuantity = existing ? existing.quantity + requestedQuantity : requestedQuantity;

        if (nextQuantity > MAX_QUANTITY) return res.status(400).json({ message: "Maximum quantity per item is 6." });

        if (existing) existing.quantity = nextQuantity;
        else cart.items.push({ menuItem: menuItemId, quantity: requestedQuantity });

        await cart.save();
        const populatedCart = await populateCart(Cart.findOne({ user: req.user._id }));
        res.json({ message: "Item added to cart.", cart: formatCart(populatedCart) });
    } catch (error) {
        res.status(500).json({ message: "Failed to add item to cart.", error: error.message });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { menuItemId, quantity } = req.body;
        const nextQuantity = Number(quantity);

        if (!menuItemId) return res.status(400).json({ message: "Menu item is required." });
        if (!Number.isInteger(nextQuantity) || nextQuantity < 1) return res.status(400).json({ message: "Quantity must be at least 1." });
        if (nextQuantity > MAX_QUANTITY) return res.status(400).json({ message: "Maximum quantity per item is 6." });

        const cart = await getOrCreateCart(req.user._id);
        const existing = cart.items.find((item) => item.menuItem.toString() === menuItemId);
        if (!existing) return res.status(404).json({ message: "Item not found in cart." });

        existing.quantity = nextQuantity;
        await cart.save();

        const populatedCart = await populateCart(Cart.findOne({ user: req.user._id }));
        res.json({ message: "Cart updated.", cart: formatCart(populatedCart) });
    } catch (error) {
        res.status(500).json({ message: "Failed to update cart.", error: error.message });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const cart = await getOrCreateCart(req.user._id);
        cart.items = cart.items.filter((item) => item.menuItem.toString() !== req.params.itemId);
        await cart.save();

        const populatedCart = await populateCart(Cart.findOne({ user: req.user._id }));
        res.json({ message: "Item removed from cart.", cart: formatCart(populatedCart) });
    } catch (error) {
        res.status(500).json({ message: "Failed to remove item.", error: error.message });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await getOrCreateCart(req.user._id);
        cart.items = [];
        await cart.save();

        const populatedCart = await populateCart(Cart.findOne({ user: req.user._id }));
        res.json({ message: "Cart cleared.", cart: formatCart(populatedCart) });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear cart.", error: error.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };

```

## backend/controllers/menuController.js

```js
﻿const MenuItem = require("../models/MenuItem");

const getMenuItems = async (req, res) => {
    try {
        const { category, search } = req.query;
        const query = {};

        if (category && category !== "All") query.category = category;
        if (search) query.name = { $regex: search, $options: "i" };

        const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: "Failed to load menu.", error: error.message });
    }
};

const getMenuItemById = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Menu item not found." });

        res.json({ item });
    } catch (error) {
        res.status(500).json({ message: "Failed to load menu item.", error: error.message });
    }
};

module.exports = { getMenuItems, getMenuItemById };

```

## backend/controllers/notificationController.js

```js
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
        const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: "Failed to load notifications.", error: error.message });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid notification id." });

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) return res.status(404).json({ message: "Notification not found." });

        const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
        res.json({ message: "Notification marked as read.", notification, unreadCount });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notification.", error: error.message });
    }
};

const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
        res.json({ message: "All notifications marked as read.", unreadCount: 0 });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notifications.", error: error.message });
    }
};

module.exports = { getNotifications, markNotificationRead, markAllNotificationsRead };

```

## backend/controllers/orderController.js

```js
﻿const crypto = require("crypto");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const User = require("../models/User");
const { orderCreatedEmail } = require("../utils/emailTemplates");
const sendEmail = require("../utils/sendEmail");
const { generateInvoicePdf } = require("../utils/invoiceGenerator");

const userFields = "fullName email role ucid branch className division designation profilePic";

const createOrderNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `ORD-${date}-${suffix}`;
};

const createOrder = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.menuItem");
        if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Your cart is empty." });

        const invalidItem = cart.items.find((item) => !item.menuItem || !item.menuItem.available);
        if (invalidItem) {
            return res.status(400).json({ message: "One or more cart items are no longer available. Review your cart and try again." });
        }

        const items = cart.items.map((item) => ({
            menuItem: item.menuItem._id,
            name: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity,
            subtotal: item.menuItem.price * item.quantity
        }));
        const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
        const order = await Order.create({
            user: req.user._id,
            userRole: req.user.role,
            orderNumber: createOrderNumber(),
            items,
            totalAmount,
            paymentMethod: "Pay At Pickup"
        });

        cart.items = [];
        await cart.save();

        const populatedOrder = await Order.findById(order._id).populate("user", userFields);
        const admins = await User.find({ role: "admin", isActive: { $ne: false } }).select("_id");
        await Notification.create([
            {
                user: req.user._id,
                title: "Order placed",
                message: `${order.orderNumber} has been received by the canteen.`,
                type: "order_created"
            },
            ...admins.map((admin) => ({
                user: admin._id,
                title: "New order placed",
                message: `${req.user.fullName} placed ${order.orderNumber} for Rs. ${totalAmount}.`,
                type: "admin_new_order"
            }))
        ]).catch((error) => console.error("Notification creation failed:", error.message));
        const email = orderCreatedEmail(populatedOrder);
        sendEmail({ to: populatedOrder.user.email, ...email }).catch((error) => console.error("Order email failed:", error.message));
        res.status(201).json({ message: "Order placed successfully.", order: populatedOrder });
    } catch (error) {
        res.status(500).json({ message: "Failed to create order.", error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Failed to load orders.", error: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order id." });

        const order = await Order.findById(req.params.id).populate("user", userFields);
        if (!order) return res.status(404).json({ message: "Order not found." });

        const ownsOrder = order.user._id.toString() === req.user._id.toString();
        if (req.user.role !== "admin" && !ownsOrder) return res.status(403).json({ message: "Access denied." });

        res.json({ order });
    } catch (error) {
        res.status(500).json({ message: "Failed to load order.", error: error.message });
    }
};

const downloadInvoice = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order id." });

        const order = await Order.findById(req.params.id).populate("user", userFields);
        if (!order) return res.status(404).json({ message: "Order not found." });

        const ownsOrder = order.user._id.toString() === req.user._id.toString();
        if (req.user.role !== "admin" && !ownsOrder) return res.status(403).json({ message: "Access denied." });

        const safeOrderNumber = order.orderNumber.replace(/[^A-Za-z0-9-]/g, "");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="invoice-${safeOrderNumber}.pdf"`);
        generateInvoicePdf(order, res);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate invoice.", error: error.message });
    }
};

module.exports = { createOrder, getOrders, getOrderById, downloadInvoice };


```

## backend/middleware/authMiddleware.js

```js
﻿const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized. Token missing." });
        }

        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password -emailVerificationToken -passwordResetToken");

        if (!user) {
            return res.status(401).json({ message: "Not authorized. User not found." });
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: "Your account has been disabled. Contact the administrator." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized. Token invalid or expired." });
    }
};

const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied." });
        }

        next();
    };
};

module.exports = { protect, allowRoles };






```

## backend/middleware/errorMiddleware.js

```js
const formatValidationErrors = (error) => Object.values(error.errors || {}).map((item) => item.message);

const notFound = (req, res, next) => {
    res.status(404);
    next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message || "Server error.";
    let errors;

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed.";
        errors = formatValidationErrors(err);
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource id.";
    }

    if (err.code === 11000) {
        statusCode = 409;
        const fields = Object.keys(err.keyValue || {}).join(", ");
        message = fields ? `Duplicate value for ${fields}.` : "Duplicate value.";
    }

    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired.";
    }

    if (message.startsWith("Route not found:")) {
        message = "Route not found";
    }

    const response = {
        success: false,
        message
    };

    if (errors) response.errors = errors;
    if (process.env.NODE_ENV !== "production") response.stack = err.stack;

    res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };

```

## backend/middleware/validateRequest.js

```js
const validateRequest = (validator, source = "body") => (req, res, next) => {
    const errors = validator(req[source] || {}, req);

    if (Array.isArray(errors) && errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors[0],
            errors
        });
    }

    next();
};

module.exports = validateRequest;

```

## backend/models/Cart.js

```js
﻿const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
{
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    }
},
{
    _id: false
}
);

const cartSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    items: [cartItemSchema]
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Cart", cartSchema);

```

## backend/models/MenuItem.js

```js
﻿const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        enum: ["Veg", "Non Veg", "Snacks", "Drinks"],
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    imageUrl: {
        type: String,
        required: true
    },

    available: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
}
);

menuItemSchema.index({ category: 1, available: 1 });
menuItemSchema.index({ name: 1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);

```

## backend/models/Notification.js

```js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ["order_created", "order_received", "order_preparing", "order_ready", "admin_new_order"],
        required: true,
        index: true
    },
    read: { type: Boolean, default: false, index: true }
},
{ timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

```

## backend/models/Order.js

```js
﻿const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 6 },
    subtotal: { type: Number, required: true, min: 0 }
},
{ _id: false }
);

const orderSchema = new mongoose.Schema(
{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userRole: { type: String, enum: ["student", "faculty"], required: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (items) => items.length > 0,
            message: "An order must contain at least one item."
        }
    },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["Pay At Pickup"], default: "Pay At Pickup" },
    status: {
        type: String,
        enum: ["Received", "Preparing", "Ready To Pick Up"],
        default: "Received",
        index: true
    }
},
{ timestamps: true }
);

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);


```

## backend/models/User.js

```js
﻿const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    role: {
        type: String,
        enum: ["student", "faculty", "admin"],
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    ucid: {
        type: String
    },

    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    gender: String,

    branch: String,

    className: String,

    division: String,

    designation: String,

    profilePic: String,
    profilePicPublicId: String,

    isVerified: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
},
{
    timestamps: true
}
);

module.exports = mongoose.model("User", userSchema);





```

## backend/routes/adminRoutes.js

```js
﻿const express = require("express");
const { upload, getDashboardStats, getAnalytics, getAdminOrders, updateOrderStatus, getUsers, toggleUser, getAdminMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require("../controllers/adminController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, allowRoles("admin"));
router.get("/dashboard", getDashboardStats);
router.get("/analytics", getAnalytics);
router.get("/orders", getAdminOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/users", getUsers);
router.put("/users/:id/toggle", toggleUser);
router.get("/menu", getAdminMenu);
router.post("/menu", upload.single("image"), createMenuItem);
router.put("/menu/:id", upload.single("image"), updateMenuItem);
router.delete("/menu/:id", deleteMenuItem);

module.exports = router;


```

## backend/routes/authRoutes.js

```js
﻿const express = require("express");
const {
    upload,
    registerStudent,
    registerFaculty,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register/student", registerStudent);
router.post("/register/faculty", registerFaculty);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profilePic"), updateProfile);

module.exports = router;


```

## backend/routes/cartRoutes.js

```js
﻿const express = require("express");
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem);
router.delete("/remove/:itemId", protect, removeCartItem);
router.delete("/clear", protect, clearCart);

module.exports = router;

```

## backend/routes/menuRoutes.js

```js
﻿const express = require("express");
const { getMenuItems, getMenuItemById } = require("../controllers/menuController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMenuItems);
router.get("/:id", protect, getMenuItemById);

module.exports = router;

```

## backend/routes/notificationRoutes.js

```js
const express = require("express");
const { getNotifications, markNotificationRead, markAllNotificationsRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllNotificationsRead);

module.exports = router;

```

## backend/routes/orderRoutes.js

```js
﻿const express = require("express");
const { createOrder, getOrders, getOrderById, downloadInvoice } = require("../controllers/orderController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, allowRoles("student", "faculty"), createOrder);
router.get("/", protect, allowRoles("student", "faculty"), getOrders);
router.get("/:id/invoice", protect, downloadInvoice);
router.get("/:id", protect, getOrderById);

module.exports = router;


```

## backend/seeds/menuSeed.js

```js
﻿require("dotenv").config();

const connectDB = require("../config/db");
const MenuItem = require("../models/MenuItem");

const image = (text) => `https://placehold.co/640x420/e8f3ef/17202a?text=${encodeURIComponent(text)}`;

const items = [
    { name: "Paneer Butter Masala", description: "Creamy paneer curry with tomato gravy and mild spices.", category: "Veg", price: 140 },
    { name: "Veg Biryani", description: "Fragrant rice cooked with vegetables, herbs, and spices.", category: "Veg", price: 120 },
    { name: "Pav Bhaji", description: "Mumbai-style mashed vegetable curry served with buttered pav.", category: "Veg", price: 90 },
    { name: "Masala Dosa", description: "Crisp dosa filled with spiced potato masala.", category: "Veg", price: 80 },
    { name: "Idli Sambar", description: "Steamed idlis served with sambar and chutney.", category: "Veg", price: 60 },
    { name: "Chole Bhature", description: "Spiced chickpeas served with fluffy bhature.", category: "Veg", price: 110 },
    { name: "Veg Fried Rice", description: "Wok-tossed rice with vegetables and sauces.", category: "Veg", price: 100 },
    { name: "Veg Noodles", description: "Stir-fried noodles with crunchy vegetables.", category: "Veg", price: 100 },
    { name: "Chicken Biryani", description: "Layered rice and chicken cooked with aromatic spices.", category: "Non Veg", price: 160 },
    { name: "Butter Chicken", description: "Chicken simmered in a rich buttery tomato gravy.", category: "Non Veg", price: 170 },
    { name: "Chicken Fried Rice", description: "Fried rice tossed with chicken, egg, and vegetables.", category: "Non Veg", price: 130 },
    { name: "Chicken Noodles", description: "Noodles stir-fried with chicken and vegetables.", category: "Non Veg", price: 130 },
    { name: "Egg Curry", description: "Boiled eggs in a spiced onion tomato curry.", category: "Non Veg", price: 100 },
    { name: "Chicken Roll", description: "Paratha roll stuffed with spicy chicken filling.", category: "Non Veg", price: 110 },
    { name: "Samosa", description: "Crisp pastry filled with spiced potato.", category: "Snacks", price: 25 },
    { name: "Vada Pav", description: "Spiced potato fritter in pav with chutneys.", category: "Snacks", price: 30 },
    { name: "French Fries", description: "Golden fried potato fries with seasoning.", category: "Snacks", price: 70 },
    { name: "Veg Sandwich", description: "Grilled vegetable sandwich with chutney and cheese.", category: "Snacks", price: 65 },
    { name: "Cold Coffee", description: "Chilled coffee blended with milk and sugar.", category: "Drinks", price: 80 },
    { name: "Masala Chaas", description: "Spiced buttermilk with roasted cumin and herbs.", category: "Drinks", price: 35 },
    { name: "Lassi", description: "Sweet chilled yogurt drink.", category: "Drinks", price: 60 },
    { name: "Fresh Lime Soda", description: "Refreshing lime soda served sweet, salted, or mixed.", category: "Drinks", price: 50 }
].map((item) => ({ ...item, imageUrl: image(item.name), available: true }));

const seedMenu = async () => {
    try {
        await connectDB();
        await MenuItem.deleteMany({});
        await MenuItem.insertMany(items);
        console.log(`Seeded ${items.length} menu items.`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedMenu();

```

## backend/utils/cloudinary.js

```js
﻿const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadBuffer = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });

        stream.end(buffer);
    });
};

module.exports = { cloudinary, uploadBuffer };


```

## backend/utils/emailTemplates.js

```js
const brandName = "SPIT Pvt. Ltd.";

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
}).format(new Date(value));

const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const layout = ({ title, intro, rows = [], footerNote }) => {
    const rowHtml = rows.map(([label, value]) => `
        <tr>
            <td style="padding:10px 0;color:#5c6d7c;font-weight:700;">${escapeHtml(label)}</td>
            <td style="padding:10px 0;color:#17202a;text-align:right;font-weight:800;">${escapeHtml(value)}</td>
        </tr>
    `).join("");

    return `
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${escapeHtml(title)}</title>
        </head>
        <body style="margin:0;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#17202a;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f8;padding:24px 12px;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e0e6ed;border-radius:8px;overflow:hidden;">
                            <tr>
                                <td style="background:#0f6b5f;color:#ffffff;padding:22px 24px;">
                                    <p style="margin:0 0 6px;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">${brandName}</p>
                                    <h1 style="margin:0;font-size:24px;line-height:1.2;">${escapeHtml(title)}</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:24px;">
                                    <p style="margin:0 0 18px;line-height:1.6;color:#334756;">${intro}</p>
                                    ${rows.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e6edf3;border-bottom:1px solid #e6edf3;margin:18px 0;">${rowHtml}</table>` : ""}
                                    ${footerNote ? `<p style="margin:18px 0 0;line-height:1.6;color:#334756;">${footerNote}</p>` : ""}
                                </td>
                            </tr>
                            <tr>
                                <td style="background:#f8fafb;padding:16px 24px;color:#6a7a88;font-size:13px;line-height:1.5;">
                                    This is an automated update from ${brandName}. Please do not reply to this email.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

const orderCreatedEmail = (order) => ({
    subject: `Order received: ${order.orderNumber}`,
    html: layout({
        title: "Order Received",
        intro: `Hello ${escapeHtml(order.user.fullName)}, your canteen order has been received successfully.`,
        rows: [
            ["Order Number", order.orderNumber],
            ["Order Date", formatDate(order.createdAt)],
            ["Total Amount", formatCurrency(order.totalAmount)],
            ["Payment Method", order.paymentMethod],
            ["Current Status", order.status]
        ]
    })
});

const orderPreparingEmail = (order) => ({
    subject: `Order preparing: ${order.orderNumber}`,
    html: layout({
        title: "Order Preparing",
        intro: `Hello ${escapeHtml(order.user.fullName)}, your order is now being prepared.`,
        rows: [
            ["Order Number", order.orderNumber],
            ["Current Status", order.status]
        ]
    })
});

const orderReadyEmail = (order) => ({
    subject: `Order ready for pickup: ${order.orderNumber}`,
    html: layout({
        title: "Order Ready To Pick Up",
        intro: `Hello ${escapeHtml(order.user.fullName)}, your order is ready.`,
        rows: [
            ["Order Number", order.orderNumber],
            ["Current Status", order.status]
        ],
        footerNote: "Please collect your order from the canteen pickup counter and keep your order number handy."
    })
});

module.exports = { orderCreatedEmail, orderPreparingEmail, orderReadyEmail };

```

## backend/utils/invoiceGenerator.js

```js
const PDFDocument = require("pdfkit");

const brandName = "SPIT Pvt. Ltd.";

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
}).format(new Date(value));

const drawRow = (doc, y, values, widths, options = {}) => {
    let x = doc.page.margins.left;
    values.forEach((value, index) => {
        doc.font(options.bold ? "Helvetica-Bold" : "Helvetica")
            .fontSize(options.fontSize || 10)
            .fillColor(options.color || "#17202a")
            .text(String(value), x, y, { width: widths[index], align: index === 0 ? "left" : "right" });
        x += widths[index];
    });
};

const drawLabelValue = (doc, label, value, x, y, width) => {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#5c6d7c").text(label, x, y, { width });
    doc.font("Helvetica").fontSize(10).fillColor("#17202a").text(value || "-", x, y + 14, { width });
};

const generateInvoicePdf = (order, stream) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    doc.pipe(stream);

    const user = order.user || {};
    const left = doc.page.margins.left;
    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.rect(0, 0, doc.page.width, 96).fill("#0f6b5f");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(22).text(brandName, left, 30);
    doc.font("Helvetica").fontSize(12).text("Campus Canteen Invoice", left, 58);

    doc.fillColor("#17202a").font("Helvetica-Bold").fontSize(20).text("Invoice", left, 128);
    doc.font("Helvetica").fontSize(10).fillColor("#5c6d7c").text(`Generated on ${formatDate(new Date())}`, left, 154);

    const boxY = 188;
    doc.roundedRect(left, boxY, contentWidth, 126, 8).strokeColor("#d9e2ea").lineWidth(1).stroke();
    drawLabelValue(doc, "Order Number", order.orderNumber, left + 18, boxY + 18, 150);
    drawLabelValue(doc, "Order Date", formatDate(order.createdAt), left + 190, boxY + 18, 160);
    drawLabelValue(doc, "Payment Method", order.paymentMethod, left + 370, boxY + 18, 130);
    drawLabelValue(doc, "User Name", user.fullName, left + 18, boxY + 68, 150);
    drawLabelValue(doc, "Email", user.email, left + 190, boxY + 68, 160);
    drawLabelValue(doc, "Role / UCID", `${user.role || "-"}${user.ucid ? ` / ${user.ucid}` : ""}`, left + 370, boxY + 68, 130);

    doc.font("Helvetica-Bold").fontSize(12).fillColor("#17202a").text("Items", left, 350);
    const tableY = 378;
    const widths = [230, 70, 100, 100];
    doc.rect(left, tableY - 8, contentWidth, 30).fill("#f3f6f8");
    drawRow(doc, tableY, ["Item Name", "Quantity", "Unit Price", "Subtotal"], widths, { bold: true, color: "#334756" });

    let y = tableY + 36;
    order.items.forEach((item) => {
        if (y > 710) {
            doc.addPage();
            y = 64;
            doc.rect(left, y - 8, contentWidth, 30).fill("#f3f6f8");
            drawRow(doc, y, ["Item Name", "Quantity", "Unit Price", "Subtotal"], widths, { bold: true, color: "#334756" });
            y += 36;
        }
        doc.moveTo(left, y - 10).lineTo(left + contentWidth, y - 10).strokeColor("#e6edf3").stroke();
        drawRow(doc, y, [item.name, item.quantity, formatCurrency(item.price), formatCurrency(item.subtotal)], widths);
        y += 34;
    });

    doc.moveTo(left, y - 6).lineTo(left + contentWidth, y - 6).strokeColor("#cbd6df").stroke();
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#17202a").text("Total Amount", left + 300, y + 12, { width: 100, align: "right" });
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#0f6b5f").text(formatCurrency(order.totalAmount), left + 400, y + 10, { width: 100, align: "right" });

    const footerY = doc.page.height - 86;
    doc.moveTo(left, footerY - 14).lineTo(left + contentWidth, footerY - 14).strokeColor("#e6edf3").stroke();
    doc.font("Helvetica").fontSize(9).fillColor("#6a7a88")
        .text(`Order Status: ${order.status}`, left, footerY)
        .text("Thank you for ordering from the campus canteen.", left, footerY + 16)
        .text(`${brandName} | This invoice was generated digitally.`, left, footerY + 32);

    doc.end();
};

module.exports = { generateInvoicePdf };

```

## backend/utils/sendEmail.js

```js
﻿const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
    const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length) {
        console.log("Email not sent. Missing env:", missing.join(", "));
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        html
    });
};

module.exports = sendEmail;


```

## backend/utils/tokens.js

```js
﻿const crypto = require("crypto");

const createTokenPair = () => {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    return { token, hashedToken };
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

module.exports = { createTokenPair, hashToken };


```

## backend/utils/validators.js

```js
﻿const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const studentClassOptions = {
    CSE: ["1st Year BTech", "2nd Year BTech", "3rd Year BTech", "4th Year BTech", "FYMCA", "SYMCA", "FYMTech", "SYMTech"],
    EXTC: ["1st Year BTech", "2nd Year BTech", "3rd Year BTech", "4th Year BTech", "FYMTech", "SYMTech"],
    COMS: ["1st Year BTech", "2nd Year BTech", "3rd Year BTech", "4th Year BTech", "FYMTech", "SYMTech"]
};

const genders = ["Male", "Female", "Prefer not to say"];
const branches = ["CSE", "EXTC", "COMS"];
const divisions = ["A", "B", "C", "D"];

const isValidEmail = (email) => emailRegex.test(String(email || "").trim());
const isStrongPassword = (password) => passwordRegex.test(String(password || ""));

const validatePasswordMatch = (password, confirmPassword, errors) => {
    if (!isStrongPassword(password)) {
        errors.push("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
    }

    if (password !== confirmPassword) {
        errors.push("Passwords do not match.");
    }
};

const validateStudentRegistration = (body) => {
    const errors = [];
    const required = ["fullName", "ucid", "email", "gender", "branch", "className", "division", "password", "confirmPassword"];

    required.forEach((field) => {
        if (!String(body[field] || "").trim()) errors.push(`${field} is required.`);
    });

    if (!/^\d{10}$/.test(String(body.ucid || ""))) errors.push("UCID must be exactly 10 digits.");
    if (!isValidEmail(body.email)) errors.push("Enter a valid email address.");
    if (!genders.includes(body.gender)) errors.push("Select a valid gender.");
    if (!branches.includes(body.branch)) errors.push("Select a valid branch.");
    if (!studentClassOptions[body.branch]?.includes(body.className)) errors.push("Select a valid class for the selected branch.");
    if (!divisions.includes(body.division)) errors.push("Select a valid division.");

    validatePasswordMatch(body.password, body.confirmPassword, errors);

    return errors;
};

const validateFacultyRegistration = (body) => {
    const errors = [];
    const required = ["fullName", "email", "gender", "branch", "designation", "password", "confirmPassword"];

    required.forEach((field) => {
        if (!String(body[field] || "").trim()) errors.push(`${field} is required.`);
    });

    if (!isValidEmail(body.email)) errors.push("Enter a valid email address.");
    if (!genders.includes(body.gender)) errors.push("Select a valid gender.");
    if (!branches.includes(body.branch)) errors.push("Select a valid branch.");

    validatePasswordMatch(body.password, body.confirmPassword, errors);

    return errors;
};

module.exports = {
    isValidEmail,
    isStrongPassword,
    validateStudentRegistration,
    validateFacultyRegistration,
    studentClassOptions
};

```

## backend/package.json

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed:menu": "node seeds/menuSeed.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cloudinary": "^2.10.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.5.2",
    "helmet": "^8.2.0",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.7.1",
    "morgan": "^1.11.0",
    "multer": "^2.2.0",
    "nodemailer": "^9.0.1",
    "pdfkit": "^0.19.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}

```

## backend/.env.example

```txt
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campus-canteen
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Campus Canteen <no-reply@campus-canteen.local>"
```
