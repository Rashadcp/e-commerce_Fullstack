import Order from "../models/Order.js";
import mongoose from "mongoose";

// @desc    Get orders (Admin sees all, user sees their own)
// @route   GET /orders
export const getOrders = async (req, res) => {
    try {
        let filter = {};

        if (!req.user.isAdmin) {
            filter.user = req.user._id;
        } else if (req.query.user) {
            // Admin can filter by specific user ID
            filter.user = req.query.user;
        }

        const ordersRaw = await Order.find(filter)
            .populate("items.product", "image")
            .sort({ date: -1 });

        // Backfill images for old orders that didn't save them
        const orders = ordersRaw.map(order => {
            const orderObj = order.toObject();
            orderObj.id = orderObj._id;
            orderObj.items = orderObj.items.map(item => ({
                ...item,
                image: item.image || item.product?.image || ""
            }));
            return orderObj;
        });

        res.json(orders);
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
