import express from "express";
import {
    getOrders,
    createOrder,
    updateOrderStatus,
    updateOrder
} from "../controllers/orderController.js";

import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // All order routes require login

router.get("/", getOrders);
router.post("/", createOrder);
router.patch("/:id", updateOrderStatus);
router.put("/:id", updateOrder);

export default router;
