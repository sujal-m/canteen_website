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
