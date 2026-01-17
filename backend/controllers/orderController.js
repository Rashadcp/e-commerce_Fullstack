import Order from "../models/Order.js";
import mongoose from "mongoose";

// @desc    Get orders (Admin sees all, user sees their own)
// @route   GET /orders
// @desc    Get orders (Admin sees all, user sees their own)
// @route   GET /orders
export const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", status = "" } = req.query;
        let filter = {};

        if (!req.user.isAdmin) {
            filter.user = req.user._id;
        } else {
            // Admin filters
            if (search) {
                const searchQueries = [];

                // 1. Search by Order ID (Exact match if valid ObjectId)
                if (mongoose.Types.ObjectId.isValid(search)) {
                    searchQueries.push({ _id: search });
                }

                // 2. Search by User Name/Email -> Find User IDs -> Filter Orders by User IDs
                const User = mongoose.model("User");
                const users = await User.find({
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } }
                    ]
                }).select("_id");

                const userIds = users.map(u => u._id);
                if (userIds.length > 0) {
                    searchQueries.push({ user: { $in: userIds } });
                }

                if (searchQueries.length > 0) {
                    filter.$or = searchQueries;
                } else if (!filter.$or) {
                    // If searched but no ID match and no User match, limit results to nothing to avoid showing all
                    filter._id = new mongoose.Types.ObjectId(); // Dummy ID that won't match
                }
            }
            if (status) {
                filter.status = status;
            }
        }

        const count = await Order.countDocuments(filter);

        const ordersRaw = await Order.find(filter)
            .populate("user", "name email number")
            .populate("items.product", "image")
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Backfill images and flatten structure
        const orders = ordersRaw.map(order => {
            const orderObj = order.toObject();
            orderObj.id = orderObj._id;
            orderObj.customerName = orderObj.user?.name || "Unknown Customer";
            orderObj.customerEmail = orderObj.user?.email || "";
            orderObj.customerPhone = orderObj.user?.number || "";
            orderObj.items = orderObj.items.map(item => ({
                ...item,
                image: item.image || item.product?.image || ""
            }));
            return orderObj;
        });

        res.json({
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalOrders: count
        });

    } catch (error) {
        console.error("Get Orders Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const createOrder = async (req, res) => {
    try {
        console.log("--- [DEBUG] createOrder hit ---");
        console.log("[DEBUG] req.user:", req.user ? { _id: req.user._id, email: req.user.email } : "MISSING");

        const { items, totalAmount, shippingAddress, paymentMethod, paymentDetails } = req.body;
        console.log("[DEBUG] items count:", items?.length);

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        const userId = req.user?._id || req.user?.id;
        console.log("[DEBUG] userId to be used:", userId);

        if (!userId) {
            console.error("[DEBUG] FATAL: Missing userId");
            return res.status(401).json({ message: "User not identified" });
        }

        const orderItems = items.map((item, index) => {
            const productId = item.id || item._id || item.productId;
            console.log(`[DEBUG] Item ${index} productId:`, productId);
            return {
                product: productId,
                name: item.name,
                image: item.image,
                quantity: item.quantity || 1,
                price: item.price
            };
        });

        const hasInvalidProduct = orderItems.some(item => !item.product);
        if (hasInvalidProduct) {
            console.error("[DEBUG] FATAL: Missing product in items");
            return res.status(400).json({ message: "One or more items are missing a valid product ID." });
        }

        const orderData = {
            user: userId,
            items: orderItems,
            totalAmount,
            shippingAddress: shippingAddress || {
                address: "Not provided",
                city: "Not provided",
                postalCode: "000000",
                country: "India"
            },
            paymentMethod,
            paymentDetails,
            status: "Processing"
        };

        console.log("[DEBUG] Final orderData to save:", JSON.stringify(orderData, null, 2));

        const order = new Order(orderData);
        console.log("[DEBUG] Mongoose order.user:", order.user);

        const newOrder = await order.save();
        console.log("[DEBUG] Success! Order ID:", newOrder._id);
        res.status(201).json(newOrder);
    } catch (error) {
        console.error("[DEBUG] CATCH Error:", error);
        res.status(400).json({
            message: "Order validation failed",
            details: error.message
        });
    }
    console.log("--- [DEBUG] createOrder end ---");
};

// @desc    Update order status (Patch)
// @route   PATCH /orders/:id
export const updateOrderStatus = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update order (Put)
// @route   PUT /orders/:id
export const updateOrder = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
