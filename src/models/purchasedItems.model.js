import mongoose, { Schema } from "mongoose";

const PurchasedItemsSchema=new mongoose.Schema({
    ProductName:{
        type:Schema.Types.ObjectId,
        ref:'Product'
    },
    PurchasedBy:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true})

export const PurchasedItem=mongoose.model('PurchasedItem',PurchasedItemsSchema)