const crypto = require("crypto");
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

