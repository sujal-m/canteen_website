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
