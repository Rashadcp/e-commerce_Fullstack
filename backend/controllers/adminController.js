
import Order from "../models/Order.js";
import Product from "../models/product.js";
import User from "../models/User.js";

// @desc    Get Admin Dashboard Stats
// @route   GET /admin/dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();

        const orders = await Order.find()
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

        const recentOrders = await Order.find()
            .sort({ date: -1 })
            .limit(5)
            .populate("user", "name email");

        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue,
            recentOrders
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
