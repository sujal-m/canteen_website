const express = require("express");
const { getMenuItems, getMenuItemById } = require("../controllers/menuController");
const router = express.Router();

router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

module.exports = router;

