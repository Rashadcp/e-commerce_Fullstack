import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "../config/db.js";

const app = express();

// Connect DB
connectDB();

app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
import productRoutes from "../routes/productRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import cartRoutes from "../routes/cartRoutes.js";
import wishlistRoutes from "../routes/wishlistRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";

// ✅ API prefix required for Vercel
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

// ❌ NO app.listen()
export default app;
