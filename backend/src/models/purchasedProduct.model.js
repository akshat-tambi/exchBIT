import mongoose, { Schema } from "mongoose";

const purchasedProductSchema = new Schema({
    pName: { type: String, required: true },
    desc: { type: String, required: true },
    media: [{ type: String, required: true }],
    price: { type: Number, required: true },
    cat: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
    ownedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: Boolean, required: true },
    purchasedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    purchasedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export const PurchasedProduct = mongoose.model('PurchasedProduct', purchasedProductSchema);
