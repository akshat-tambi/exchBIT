import { Product } from "../models/products.model.js";
import { User } from "../models/user.model.js";
import { Category } from "../models/categories.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";
import { sendNotification } from "./notification.controller.js";

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
    const categories = Array.isArray(cat) ? cat : [cat];

    const uploadedMedia = await Promise.all(files.map(file => uploadOnCloudinary(file.path)));
    const mediaUrls = uploadedMedia.map(file => file.secure_url);

    const categoryIds = await Promise.all(categories.map(async (categoryName) => {
      let category = await Category.findOne({ prodType: categoryName });
      if (!category) {
        category = new Category({ prodType: categoryName });
        await category.save();
      }
      return category._id;
    }));

    const product = new Product({
      pName,
      desc,
      price,
      cat: categoryIds,
      media: mediaUrls,
      user: userId,
      status: false
    });

    await product.save();

    await User.findByIdAndUpdate(userId, { $push: { productsOwned: product._id } });

    await Promise.all(categoryIds.map(async (categoryId) => {
      await Category.findByIdAndUpdate(categoryId, { $addToSet: { prodList: product._id } });
    }));

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred during ad creation!" });
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

    product.user = userId;

    const mediaToDelete = Array.isArray(deleteMedia) ? deleteMedia : [deleteMedia];
    console.log(mediaToDelete);

    await Promise.all(mediaToDelete.map(async (url) => {
      const publicId = extractPublicId(url);
      const isRaw = !/\.\w+$/.test(url);
      await deleteFromCloudinary(publicId, isRaw);
      product.media = product.media.filter(mediaUrl => mediaUrl !== url);
    }));

    const categories = Array.isArray(cat) ? cat : [cat];

    const uploadedMedia = await Promise.all(newFiles.map(file => uploadOnCloudinary(file.path)));
    const mediaUrls = uploadedMedia.map(file => file.secure_url);

    const categoryIds = await Promise.all(categories.map(async (categoryName) => {
      let category = await Category.findOne({ prodType: categoryName });
      if (!category) {
        category = new Category({ prodType: categoryName });
        await category.save();
      }
      return category._id;
    }));

    product.media = [...product.media, ...mediaUrls];
    product.pName = pName || product.pName;
    product.desc = desc || product.desc;
    product.price = price || product.price;
    product.cat = categoryIds;

    await product.save();

    if (!req.user.productsOwned.includes(product._id)) {
      await User.findByIdAndUpdate(userId, { $push: { productsOwned: product._id } });
    }

    await Promise.all(categoryIds.map(async (categoryId) => {
      await Category.findByIdAndUpdate(categoryId, { $addToSet: { prodList: product._id } });
    }));

    const oldCategories = await Category.find({ _id: { $nin: categoryIds } });
    await Promise.all(oldCategories.map(async (oldCategory) => {
      await Category.findByIdAndUpdate(oldCategory._id, { $pull: { prodList: product._id } });
    }));

    const notificationMessage = `Product ${pName} has been updated.`;
    await sendNotification(userId, notificationMessage);

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred during ad updation!" });
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  await Promise.all(product.media.map(async (url) => {
    const publicId = extractPublicId(url);
    const isRaw = !/\.\w+$/.test(url);
    await deleteFromCloudinary(publicId, isRaw);
    product.media = product.media.filter(mediaUrl => mediaUrl !== url);
  }));

  await Product.findByIdAndDelete(id);

  await User.findByIdAndUpdate(userId, {
    $pull: { productsOwned: product._id }
  });

  await Category.findByIdAndUpdate(product.cat, {
    $pull: { prodList: product._id }
  });

  const usersToUpdate = await User.find({ $or: [{ cart: product._id }, { wishList: product._id }] });
  console.log("Users to update:", usersToUpdate);

  await Promise.all(usersToUpdate.map(async (user) => {
    user.cart = user.cart.filter(cartItem => cartItem.toString() !== product._id.toString());
    user.wishList = user.wishList.filter(wishlistItem => wishlistItem.toString() !== product._id.toString());
    await user.save();
    console.log("Updated user:", user);
  }));

  const notificationMessage = `Product ${product.pName} has been deleted.`;
  await Promise.all(usersToUpdate.map(async (user) => {
    await sendNotification(user._id, notificationMessage);
  }));

  res.status(200).json({ success: true, message: "Ad deleted successfully!" });
});

export const getUserProducts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate('productsOwned');
    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json({ success: true, products: user.productsOwned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while fetching your ads!" });
  }
});

export const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ status: { $ne: true } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred during ad fetch!" });
  }
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({ _id: id, status: { $ne: true } });
    if (!product) throw new ApiError(404, "Ad not found!");
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred during ad fetch!" });
  }
});

export const getProductByCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.params;

  try {
    const category = await Category.findOne({ prodType: categoryName }).populate({
      path: 'prodList',
      match: { status: { $ne: true } }
    });
    if (!category) throw new ApiError(404, "Category not found!");

    const products = category.prodList;
    
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while fetching ads by category!" });
  }
});

export const SetStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedProduct = await Product.findByIdAndUpdate(id, {
    status: true 
  });

  res.status(201).json(new ApiResponse(201, "Ad status updated successfully"));
});
