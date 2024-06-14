import { Product } from "../models/products.model.js";
import { User } from "../models/user.model.js";
import { Category } from "../models/categories.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";
import { sendNotification } from "./notification.controller.js"; // Import the notification controller

// Function to extract public ID from Cloudinary URL
function extractPublicId(url) {
  const parts = url.split('/');
  const publicIdWithFormat = parts[parts.length - 1];
  const publicIdParts = publicIdWithFormat.split('.');
  return publicIdParts[0];
}
export const createProduct = asyncHandler(async (req, res) => {
  const { pName, desc, price, cat } = req.body;
  const userId = req.user._id;
  const files = req.files;

  try {
    // Ensure cat -> array
    const categories = Array.isArray(cat) ? cat : [cat];

    // Upload to Cloudinary
    const uploadedMedia = await Promise.all(files.map(file => uploadOnCloudinary(file.path)));
    const mediaUrls = uploadedMedia.map(file => file.secure_url);

    // Find or create categories and get their IDs
    const categoryIds = await Promise.all(categories.map(async (categoryName) => {
      let category = await Category.findOne({ prodType: categoryName });
      if (!category) {
        category = new Category({ prodType: categoryName });
        await category.save();
      }
      return category._id;
    }));

    // Create new product
    const product = new Product({
      pName,
      desc,
      price,
      cat: categoryIds,
      media: mediaUrls,
      user: userId, // Set the user field to userId
      status: true,
    });

    await product.save();

    // Update user's productsOwned
    await User.findByIdAndUpdate(userId, { $push: { productsOwned: product._id } });

    // Update the prodList array 
    await Promise.all(categoryIds.map(async (categoryId) => {
      await Category.findByIdAndUpdate(categoryId, { $addToSet: { prodList: product._id } });
    }));

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while creating the product" });
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pName, desc, price, cat, deleteMedia } = req.body;
  const userId = req.user._id;
  const newFiles = req.files;

  try {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, "Product not found");

    // Set the user field to userId
    product.user = userId;

    // DeleteMedia is always treated as an array
    const mediaToDelete = Array.isArray(deleteMedia) ? deleteMedia : [deleteMedia];

    // Public IDs from deleteMedia URLs and delete files from Cloudinary
    await Promise.all(mediaToDelete.map(async (url) => {
      const publicId = extractPublicId(url);
      const isRaw = !/\.\w+$/.test(url); // If the URL contains an extension (means not raw)
      await deleteFromCloudinary(publicId, isRaw);
      // Remove from product's media array
      product.media = product.media.filter(mediaUrl => mediaUrl !== url);
    }));

    // Cat is always sent as an array
    const categories = Array.isArray(cat) ? cat : [cat];

    // New media files to Cloudinary
    const uploadedMedia = await Promise.all(newFiles.map(file => uploadOnCloudinary(file.path)));
    const mediaUrls = uploadedMedia.map(file => file.secure_url);

    // Find or create categories and get their IDs
    const categoryIds = await Promise.all(categories.map(async (categoryName) => {
      let category = await Category.findOne({ prodType: categoryName });
      if (!category) {
        category = new Category({ prodType: categoryName });
        await category.save();
      }
      return category._id;
    }));

    // Update product media with the new files
    product.media = [...product.media, ...mediaUrls];

    // Update product details
    product.pName = pName || product.pName;
    product.desc = desc || product.desc;
    product.price = price || product.price;
    product.cat = categoryIds;

    await product.save();

    // User's productsOwned 
    if (!req.user.productsOwned.includes(product._id)) {
      await User.findByIdAndUpdate(userId, { $push: { productsOwned: product._id } });
    }

    // ProdList array 
    await Promise.all(categoryIds.map(async (categoryId) => {
      await Category.findByIdAndUpdate(categoryId, { $addToSet: { prodList: product._id } });
    }));

    // Remove product ID from prodList 
    const oldCategories = await Category.find({ _id: { $nin: categoryIds } });
    await Promise.all(oldCategories.map(async (oldCategory) => {
      await Category.findByIdAndUpdate(oldCategory._id, { $pull: { prodList: product._id } });
    }));

    const notificationMessage = `A Product ${pName} has been updated.`;
    await sendNotification(userId, notificationMessage);

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while updating the product" });
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  // Delete product media from Cloudinary
  await Promise.all(product.media.map(async (url) => {
    const publicId = extractPublicId(url);
    const isRaw = !/\.\w+$/.test(url); 
    await deleteFromCloudinary(publicId, isRaw);
    product.media = product.media.filter(mediaUrl => mediaUrl !== url);
  }));

  // Delete product from database
  await Product.findByIdAndDelete(id);

  // Update user's productsOwned
  await User.findByIdAndUpdate(userId, {
    $pull: { productsOwned: product._id }
  });

  // Update category's prodList
  await Category.findByIdAndUpdate(product.cat, {
    $pull: { prodList: product._id }
  });

  // Remove product from user's wishlist and cart
  const usersToUpdate = await User.find({ $or: [{ cart: product._id }, { wishList: product._id }] });
  console.log("Users to update:", usersToUpdate); // Log usersToUpdate

  await Promise.all(usersToUpdate.map(async (user) => {
    // Remove product from cart
    user.cart = user.cart.filter(cartItem => cartItem.toString() !== product._id.toString());
    // Remove product from wishlist
    user.wishList = user.wishList.filter(wishlistItem => wishlistItem.toString() !== product._id.toString());
    await user.save();
    console.log("Updated user:", user); // Log updated user
  }));

  // Send notification to users who have this product in their cart or wishlist
  const notificationMessage = `Product ${product.pName} has been deleted.`;
  await Promise.all(usersToUpdate.map(async (user) => {
    await sendNotification(user._id, notificationMessage);
  }));

  res.status(200).json({ success: true, message: "Product deleted successfully" });
});



export const getUserProducts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate('productsOwned');
    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json({ success: true, products: user.productsOwned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while fetching user's products" });
  }
});

export const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while fetching all products" });
  }
});

export const getUserCartProducts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate('cart');
    if (!user) throw new ApiError(404, "User not found");
    
    res.status(200).json({ success: true, cartProducts: user.cart });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while fetching user's cart products" });
  }
});

export const getUserWishlistProducts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate('wishList');
    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json({ success: true, wishlistProducts: user.wishList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while fetching user's wishlist products" });
  }
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, "Product not found");
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while fetching the product" });
  }
});

export const getProductByCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.params;

  try {
    // Find category by prodType
    const category = await Category.findOne({ prodType: categoryName }).populate('prodList');
    if (!category) throw new ApiError(404, "Category not found");

    // Extract products from category
    const products = category.prodList;

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while fetching products by category" });
  }
});
