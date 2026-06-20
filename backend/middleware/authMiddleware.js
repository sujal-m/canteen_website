const jwt = require("jsonwebtoken");
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





