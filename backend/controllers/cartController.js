const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");

const MAX_QUANTITY = 6;

const populateCart = (query) => query.populate("items.menuItem");

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    return cart;
};

const formatCart = (cart) => {
    const items = cart.items.filter((item) => item.menuItem).map((item) => ({
        menuItem: item.menuItem,
        quantity: item.quantity,
        itemTotal: item.quantity * item.menuItem.price
    }));

    const total = items.reduce((sum, item) => sum + item.itemTotal, 0);

    return { _id: cart._id, user: cart.user, items, total };
};

const getCart = async (req, res) => {
    try {
        await getOrCreateCart(req.user._id);
        const cart = await populateCart(Cart.findOne({ user: req.user._id }));
        res.json({ cart: formatCart(cart) });
    } catch (error) {
        res.status(500).json({ message: "Failed to load cart.", error: error.message });
    }
};

const addToCart = async (req, res) => {
    try {
        const { menuItemId, quantity = 1 } = req.body;
        const requestedQuantity = Number(quantity);

        if (!menuItemId) return res.status(400).json({ message: "Menu item is required." });
        if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) return res.status(400).json({ message: "Quantity must be at least 1." });

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) return res.status(404).json({ message: "Menu item not found." });
        if (!menuItem.available) return res.status(400).json({ message: "This item is currently unavailable." });

        const cart = await getOrCreateCart(req.user._id);
        const existing = cart.items.find((item) => item.menuItem.toString() === menuItemId);
        const nextQuantity = existing ? existing.quantity + requestedQuantity : requestedQuantity;

        if (nextQuantity > MAX_QUANTITY) return res.status(400).json({ message: "Maximum quantity per item is 6." });

        if (existing) existing.quantity = nextQuantity;
        else cart.items.push({ menuItem: menuItemId, quantity: requestedQuantity });

        await cart.save();
        const populatedCart = await populateCart(Cart.findOne({ user: req.user._id }));
        res.json({ message: "Item added to cart.", cart: formatCart(populatedCart) });
    } catch (error) {
        res.status(500).json({ message: "Failed to add item to cart.", error: error.message });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { menuItemId, quantity } = req.body;
        const nextQuantity = Number(quantity);

        if (!menuItemId) return res.status(400).json({ message: "Menu item is required." });
        if (!Number.isInteger(nextQuantity) || nextQuantity < 1) return res.status(400).json({ message: "Quantity must be at least 1." });
        if (nextQuantity > MAX_QUANTITY) return res.status(400).json({ message: "Maximum quantity per item is 6." });

        const cart = await getOrCreateCart(req.user._id);
        const existing = cart.items.find((item) => item.menuItem.toString() === menuItemId);
        if (!existing) return res.status(404).json({ message: "Item not found in cart." });

        existing.quantity = nextQuantity;
        await cart.save();

        const populatedCart = await populateCart(Cart.findOne({ user: req.user._id }));
        res.json({ message: "Cart updated.", cart: formatCart(populatedCart) });
    } catch (error) {
        res.status(500).json({ message: "Failed to update cart.", error: error.message });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const cart = await getOrCreateCart(req.user._id);
        cart.items = cart.items.filter((item) => item.menuItem.toString() !== req.params.itemId);
        await cart.save();

        const populatedCart = await populateCart(Cart.findOne({ user: req.user._id }));
        res.json({ message: "Item removed from cart.", cart: formatCart(populatedCart) });
    } catch (error) {
        res.status(500).json({ message: "Failed to remove item.", error: error.message });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await getOrCreateCart(req.user._id);
        cart.items = [];
        await cart.save();

        const populatedCart = await populateCart(Cart.findOne({ user: req.user._id }));
        res.json({ message: "Cart cleared.", cart: formatCart(populatedCart) });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear cart.", error: error.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
