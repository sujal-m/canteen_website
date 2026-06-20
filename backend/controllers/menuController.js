const MenuItem = require("../models/MenuItem");

const getMenuItems = async (req, res) => {
    try {
        const { category, search } = req.query;
        const query = {};

        if (category && category !== "All") query.category = category;
        if (search) query.name = { $regex: search, $options: "i" };

        const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: "Failed to load menu.", error: error.message });
    }
};

const getMenuItemById = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Menu item not found." });

        res.json({ item });
    } catch (error) {
        res.status(500).json({ message: "Failed to load menu item.", error: error.message });
    }
};

module.exports = { getMenuItems, getMenuItemById };
