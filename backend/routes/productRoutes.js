import express from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
<<<<<<< HEAD
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Public route - anyone can view products
router.get("/", getProducts);

// Admin-only routes - require authentication and admin privileges
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
=======

const router = express.Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e

export default router;
