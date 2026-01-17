import express from "express";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    replaceWishlist
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(protect, getWishlist).post(protect, addToWishlist).put(protect, replaceWishlist);
router.route("/:id").delete(protect, removeFromWishlist);

export default router;
