require("dotenv").config();

const connectDB = require("../config/db");
const MenuItem = require("../models/MenuItem");

const image = (text) => `https://placehold.co/640x420/e8f3ef/17202a?text=${encodeURIComponent(text)}`;

const items = [
    { name: "Paneer Butter Masala", description: "Creamy paneer curry with tomato gravy and mild spices.", category: "Veg", price: 140 },
    { name: "Veg Biryani", description: "Fragrant rice cooked with vegetables, herbs, and spices.", category: "Veg", price: 120 },
    { name: "Pav Bhaji", description: "Mumbai-style mashed vegetable curry served with buttered pav.", category: "Veg", price: 90 },
    { name: "Masala Dosa", description: "Crisp dosa filled with spiced potato masala.", category: "Veg", price: 80 },
    { name: "Idli Sambar", description: "Steamed idlis served with sambar and chutney.", category: "Veg", price: 60 },
    { name: "Chole Bhature", description: "Spiced chickpeas served with fluffy bhature.", category: "Veg", price: 110 },
    { name: "Veg Fried Rice", description: "Wok-tossed rice with vegetables and sauces.", category: "Veg", price: 100 },
    { name: "Veg Noodles", description: "Stir-fried noodles with crunchy vegetables.", category: "Veg", price: 100 },
    { name: "Chicken Biryani", description: "Layered rice and chicken cooked with aromatic spices.", category: "Non Veg", price: 160 },
    { name: "Butter Chicken", description: "Chicken simmered in a rich buttery tomato gravy.", category: "Non Veg", price: 170 },
    { name: "Chicken Fried Rice", description: "Fried rice tossed with chicken, egg, and vegetables.", category: "Non Veg", price: 130 },
    { name: "Chicken Noodles", description: "Noodles stir-fried with chicken and vegetables.", category: "Non Veg", price: 130 },
    { name: "Egg Curry", description: "Boiled eggs in a spiced onion tomato curry.", category: "Non Veg", price: 100 },
    { name: "Chicken Roll", description: "Paratha roll stuffed with spicy chicken filling.", category: "Non Veg", price: 110 },
    { name: "Samosa", description: "Crisp pastry filled with spiced potato.", category: "Snacks", price: 25 },
    { name: "Vada Pav", description: "Spiced potato fritter in pav with chutneys.", category: "Snacks", price: 30 },
    { name: "French Fries", description: "Golden fried potato fries with seasoning.", category: "Snacks", price: 70 },
    { name: "Veg Sandwich", description: "Grilled vegetable sandwich with chutney and cheese.", category: "Snacks", price: 65 },
    { name: "Cold Coffee", description: "Chilled coffee blended with milk and sugar.", category: "Drinks", price: 80 },
    { name: "Masala Chaas", description: "Spiced buttermilk with roasted cumin and herbs.", category: "Drinks", price: 35 },
    { name: "Lassi", description: "Sweet chilled yogurt drink.", category: "Drinks", price: 60 },
    { name: "Fresh Lime Soda", description: "Refreshing lime soda served sweet, salted, or mixed.", category: "Drinks", price: 50 }
].map((item) => ({ ...item, imageUrl: image(item.name), available: true }));

const seedMenu = async () => {
    try {
        await connectDB();
        await MenuItem.deleteMany({});
        await MenuItem.insertMany(items);
        console.log(`Seeded ${items.length} menu items.`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedMenu();
