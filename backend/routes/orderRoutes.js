import express from "express";
import {
    getOrders,
    createOrder,
    updateOrderStatus,
    updateOrder,
    createRazorpayOrder,
    verifyRazorpayPayment
} from "../controllers/orderController.js";

import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Razorpay Routes - Bypass Auth for Testing
router.post("/razorpay", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);

router.use(protect); // All other order routes require login

router.get("/", getOrders);
router.post("/", createOrder);
router.patch("/:id", updateOrderStatus);
router.put("/:id", updateOrder);

export default router;
