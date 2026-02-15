import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

const app = express();

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/orders", (req, res, next) => {
  console.log(`[ORDER ROUTE] ${req.method} ${req.url}`);
  next();
}, orderRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
