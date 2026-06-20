const express = require("express");
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

