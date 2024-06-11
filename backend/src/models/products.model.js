import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    pName: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    media: [{
        type: String, // URLs
        required: true
    }],
    price: {
        type: Number,
        required: true
    },
    cat: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }],
    status: {
        type: Boolean,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

export const Product = mongoose.model('Product', productSchema);
