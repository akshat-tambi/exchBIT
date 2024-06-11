// models/user.model.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Product } from "./products.model.js"; 

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: [true, "username should be unique"],
        trim: true,
        index: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "password is required"],
    },
    productsOwned: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    wishList: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    email: {
        type: String,
        required: [true, "email is required"],
    },
    refreshToken: {
        type: String
    },
    notif: [{
        type: Schema.Types.ObjectId,
        ref: 'Notification'
    }]
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) { return next(); }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.isPasswordTrue = async function (password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.jwtAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
}

UserSchema.methods.jwtRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
}

export const User = mongoose.model('User', UserSchema);
