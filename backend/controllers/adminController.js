const mongoose = require("mongoose");
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


