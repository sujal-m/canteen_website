const mongoose = require("mongoose");

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
