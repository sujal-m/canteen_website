const mongoose = require("mongoose");

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

