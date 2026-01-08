import User from "../models/User.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

// @desc    Get user cart
// @route   GET /cart
export const getCart = async (req, res) => {
    try {
        console.log(`[API] Fetching cart for user: ${req.user?._id}`);
        // Ensure we handle potential errors in population
        const user = await User.findById(req.user._id).populate({
            path: 'cart.productId',
            model: 'Product'
        });

        if (!user) {
            console.error(`[API] User not found during cart fetch: ${req.user?._id}`);
            return res.status(404).json({ message: "User not found" });
        }

        // Filter out items where productId failed to populate (e.g. invalid Product ID)
        // This prevents frontend from crashing if backend data is inconsistent
        const validCart = user.cart.filter(item => item.productId !== null);
        res.json(validCart);
    } catch (error) {
        console.error(`[API] GET /cart failed:`, error);
        res.status(500).json({ message: "Server error fetching cart", error: error.message });
    }
};

// @desc    Add item to cart
// @route   POST /cart
export const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const userId = req.user._id;

        // Use atomic update: if product exists, increment qty; otherwise push new
        // However, standard Mongoose array handling is tricky with atomic "upsert" inside array.
        // Simplest robust way to avoid VersionError is to read, modify, and use findByIdAndUpdate.

        // But read-modify-write still has race conditions if we rely on the read data.
        // Better: two atomic queries (one for update existing, one for push if not found)
        // OR just simple findByIdAndUpdate with optimistic concurrency disabled? 
        // No, disabling versioning is bad.

        // Best approach for this "Overwrite" style cart syncing the user does:
        // Actually, the frontend sync does "PUT /cart" mostly. 
        // But let's fix POST /cart to be safe too. 

        // Check if product exists in cart
        const user = await User.findOne({ _id: userId, "cart.productId": productId });

        if (user) {
            // Product exists, increment quantity
            await User.findOneAndUpdate(
                { _id: userId, "cart.productId": productId },
                { $inc: { "cart.$.quantity": quantity || 1 } }
            );
        } else {
            // Product doesn't exist, push
            await User.findByIdAndUpdate(userId, {
                $push: { cart: { productId, quantity: quantity || 1 } }
            });
        }

        const updatedUser = await User.findById(userId).populate("cart.productId");
        res.json(updatedUser.cart);
    } catch (error) {
        console.error("POST /cart error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /cart/:id
export const removeFromCart = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { cart: { productId: req.params.id } }
        });

        const updatedUser = await User.findById(req.user._id).populate("cart.productId");
        res.json(updatedUser.cart);
    } catch (error) {
        console.error("DELETE /cart error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear cart
// @route   DELETE /cart
export const clearCart = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
        res.json({ message: "Cart cleared" });
    } catch (error) {
        console.error("DELETE /cart error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Replace entire cart
// @route   PUT /cart
export const replaceCart = async (req, res) => {
    try {
        const { cart } = req.body;
        if (!Array.isArray(cart)) {
            return res.status(400).json({ message: "Cart data must be an array" });
        }

        // Validate IDs
        const validCart = cart.filter(item => mongoose.Types.ObjectId.isValid(item.productId));

        // Use atomic set to overwrite cart, avoiding version errors
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { cart: validCart } },
            { new: true }
        ).populate("cart.productId");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser.cart);
    } catch (error) {
        console.error(`[API] PUT /cart failed:`, error);
        res.status(500).json({ message: "Server error updating cart", error: error.message });
    }
};
