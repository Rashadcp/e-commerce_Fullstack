import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            name: { type: String, required: true },
            image: { type: String },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String }
    },
    paymentMethod: { type: String, required: true },
    paymentDetails: { type: Object },
    date: { type: Date, default: Date.now },
    status: { type: String, default: "Processing" }
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            return ret;
        }
    }
});



export default mongoose.model("Order", orderSchema);
