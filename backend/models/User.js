const mongoose = require("mongoose");

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




