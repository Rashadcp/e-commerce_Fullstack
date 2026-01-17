import User from "../models/User.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

// @desc    Get user wishlist
// @route   GET /wishlist
export const getWishlist = async (req, res) => {
    try {
        console.log(`[API] Fetching wishlist for user: ${req.user?._id}`);
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist.productId',
            model: 'Product'
        });

        if (!user) {
            console.error(`[API] User not found during wishlist fetch: ${req.user?._id}`);
            return res.status(404).json({ message: "User not found" });
        }

        const validWishlist = user.wishlist.filter(item => item.productId !== null);
        res.json(validWishlist);
    } catch (error) {
        console.error(`[API] GET /wishlist failed:`, error);
        res.status(500).json({ message: "Server error fetching wishlist", error: error.message });
    }
};

// @desc    Add item to wishlist
// @route   POST /wishlist
export const addToWishlist = async (req, res) => {
    const { productId } = req.body;

    try {
        // Atomic "addToSet" ensures uniqueness automatically
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { wishlist: { productId } }
        });

        const updatedUser = await User.findById(req.user.id).populate("wishlist.productId");
        res.json(updatedUser.wishlist);
    } catch (error) {
        console.error("Wishlist error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from wishlist
// @route   DELETE /wishlist/:id
export const removeFromWishlist = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { wishlist: { productId: req.params.id } }
        });

        const updatedUser = await User.findById(req.user.id).populate("wishlist.productId");
        res.json(updatedUser.wishlist);
    } catch (error) {
        console.error("Wishlist error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Replace entire wishlist
// @route   PUT /wishlist
export const replaceWishlist = async (req, res) => {
    try {
        const { wishlist } = req.body;
        if (!Array.isArray(wishlist)) {
            return res.status(400).json({ message: "Wishlist data must be an array" });
        }

        // Validate IDs
        const validWishlist = wishlist.filter(item => mongoose.Types.ObjectId.isValid(item.productId));

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { wishlist: validWishlist } },
            { new: true }
        ).populate("wishlist.productId");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser.wishlist);
    } catch (error) {
        console.error(`[API] PUT /wishlist failed:`, error);
        res.status(500).json({ message: "Server error updating wishlist", error: error.message });
    }
};
