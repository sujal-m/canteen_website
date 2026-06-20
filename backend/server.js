require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5000;
let server;
let shuttingDown = false;

const shutdown = async (reason, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${reason} received. Shutting down gracefully.`);

    try {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
            console.log("HTTP server closed.");
        }

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("MongoDB connection closed.");
        }
    } catch (error) {
        console.error("Error during shutdown:", error);
    } finally {
        process.exit(exitCode);
    }
};

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    void shutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
    void shutdown("unhandledRejection", 1);
});

const startServer = async () => {
    await connectDB();

    server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "development" ? 300 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." }
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({ success: true, message: "Campus Canteen API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

process.on("SIGTERM", () => {
    void shutdown("SIGTERM", 0);
});

process.on("SIGINT", () => {
    void shutdown("SIGINT", 0);
});

void startServer();
