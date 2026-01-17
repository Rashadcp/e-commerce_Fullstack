import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

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
<<<<<<< HEAD
import adminRoutes from "./routes/adminRoutes.js";
=======
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e

app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
<<<<<<< HEAD
app.use("/admin", adminRoutes);
=======
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e

const PORT = process.env.PORT || 5000;

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
