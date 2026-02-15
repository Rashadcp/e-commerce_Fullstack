import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.js';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Product.countDocuments();
        console.log(`[DB CHECK] Found ${count} products.`);
        process.exit(0);
    } catch (err) {
        console.error("[DB CHECK] Error:", err.message);
        process.exit(1);
    }
};

checkDB();
