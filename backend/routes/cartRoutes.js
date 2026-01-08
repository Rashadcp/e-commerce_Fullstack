import express from "express";
import {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    replaceCart
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(protect, getCart).post(protect, addToCart).put(protect, replaceCart).delete(protect, clearCart);
router.route("/:id").delete(protect, removeFromCart);

export default router;
