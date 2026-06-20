const express = require("express");
const { createOrder, getOrders, getOrderById, downloadInvoice } = require("../controllers/orderController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, allowRoles("student", "faculty"), createOrder);
router.get("/", protect, allowRoles("student", "faculty"), getOrders);
router.get("/:id/invoice", protect, downloadInvoice);
router.get("/:id", protect, getOrderById);

module.exports = router;

