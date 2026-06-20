const express = require("express");
const { getMenuItems, getMenuItemById } = require("../controllers/menuController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMenuItems);
router.get("/:id", protect, getMenuItemById);

module.exports = router;
