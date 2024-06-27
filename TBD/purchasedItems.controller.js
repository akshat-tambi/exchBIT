// import { asyncHandler } from "../utils/asyncHandler.js";
// import { PurchasedItem } from "../models/purchasedItems.model.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

// const PurchasedTransaction=asyncHandler(async(req,res)=>{
//     //need id of product which is purchased
//     const {productid} =req.params;

//     //need id of user who is purchasing ususally from cookies or jwt middleware
//     const userid=req.user;

//     const Purchase=await PurchasedItem.create({
//         ProductName:productid,
//         PurchasedBy:userid
//     })

//     res.status(201).json(new ApiResponse(201,Purchase,"item is purchased"));
    
// })