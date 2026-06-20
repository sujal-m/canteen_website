const express = require("express");
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

