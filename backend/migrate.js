import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import Product from "./models/product.js";
import User from "./models/User.js";
import Order from "./models/Order.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrateData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for migration...");

        const dbPath = path.join(__dirname, "../frontend/db.json");
        const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});

        // 1. Migrate Products and create a map of Old ID -> New ObjectId
        const productMap = new Map(); // Map<String (oldId), ObjectId>
        const productsToInsert = data.products.map(p => {
            const newId = new mongoose.Types.ObjectId();
            productMap.set(p.id, newId);
            return {
                _id: newId,
                name: p.name,
                price: p.price,
                image: p.image,
                category: p.category,
                stock: 0, // Default stock
                description: p.name // Default description
            };
        });
        await Product.insertMany(productsToInsert);
        console.log(`${productsToInsert.length} products migrated.`);

        // 2. Migrate Users and create a map of Email -> New ObjectId
        const userMap = new Map(); // Map<String (email), ObjectId>
        const usersToInsert = data.users.map(u => {
            const newId = new mongoose.Types.ObjectId();
            userMap.set(u.email, newId);

            // Map cart items if any
            const cartItems = (u.cart || []).map(item => {
                const prodId = productMap.get(item.id);
                if (!prodId) return null;
                return {
                    productId: prodId,
                    quantity: item.quantity || 1
                };
            }).filter(Boolean); // Remove nulls

            return {
                _id: newId,
                name: u.name,
                number: u.number,
                email: u.email,
                password: u.password, // Ideally hash this if not hashed
                blocked: u.blocked || false,
                cart: cartItems,
                wishlist: []
            };
        });

        await User.insertMany(usersToInsert);
        console.log(`${usersToInsert.length} users migrated.`);

        // 3. Migrate Orders using the maps
        const ordersToInsert = data.orders.map(o => {
            const userId = userMap.get(o.user);
            if (!userId) {
                console.warn(`Skipping order ${o.id}: User ${o.user} not found.`);
                return null;
            }

            const orderItems = o.items.map(item => {
                const prodId = productMap.get(item.id);
                if (!prodId) return null; // Skip invalid products
                return {
                    product: prodId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                };
            }).filter(Boolean);

            if (orderItems.length === 0) return null;

            return {
                user: userId,
                items: orderItems,
                totalAmount: o.totalAmount,
                paymentMethod: o.paymentMethod,
                paymentDetails: o.paymentDetails,
                date: isNaN(Date.parse(o.date)) ? (o.date && o.date.includes('/') ? new Date(o.date.split(',')[0].split('/').reverse().join('-')) : new Date()) : new Date(o.date),
                status: o.status === "Paid" || o.status === "Delivered" ? o.status : "Processing",
                shippingAddress: {
                    address: "123 Main St", // Dummy default
                    city: "City",
                    postalCode: "000000",
                    country: "India"
                }
            };
        }).filter(Boolean);

        await Order.insertMany(ordersToInsert);
        console.log(`${ordersToInsert.length} orders migrated.`);

        console.log("Migration finished successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration error:", error);
        if (error.errors) {
            console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
        }
        process.exit(1);
    }
};

migrateData();
