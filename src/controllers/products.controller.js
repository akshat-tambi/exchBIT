import { Product } from "../models/products.model.js";
import { User } from "../models/user.model.js";
import { Category } from "../models/categories.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";

export const createProduct = asyncHandler(async (req, res) => {
  const { pName, desc, price, cat } = req.body;
  const userId = req.user._id;
  const files = req.files; 

  const uploadedMedia = await Promise.all(files.map(file => uploadOnCloudinary(file.path)));

  const product = new Product({
    pName,
    desc,
    price,
    cat,
    media: uploadedMedia,
    ownedBy: userId,
    status: true,
  });

  await product.save();

  await User.findByIdAndUpdate(userId, {
    $push: { productsOwned: product._id }
  });

  await Category.findByIdAndUpdate(cat, {
    $push: { prodList: product._id }
  });

  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pName, desc, price, cat, deleteMedia } = req.body;
  const userId = req.user._id;
  const newFiles = req.files; 

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");


  await Promise.all(deleteMedia.map(file => deleteFromCloudinary(file)));
  

  const uploadedMedia = await Promise.all(newFiles.map(file => uploadOnCloudinary(file.path)));
  product.media = product.media.filter(file => !deleteMedia.includes(file)).concat(uploadedMedia);

  const oldCat = product.cat;
  product.pName = pName || product.pName;
  product.desc = desc || product.desc;
  product.price = price || product.price;
  product.cat = cat || product.cat;

  await product.save();


  if (!req.user.productsOwned.includes(product._id)) {
    await User.findByIdAndUpdate(userId, {
      $push: { productsOwned: product._id }
    });
  }


  if (cat !== oldCat) {
    await Category.findByIdAndUpdate(oldCat, {
      $pull: { prodList: product._id }
    });
    await Category.findByIdAndUpdate(cat, {
      $push: { prodList: product._id }
    });
  }

  res.status(200).json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");


  await Promise.all(product.media.map(file => deleteFromCloudinary(file)));

  await Product.findByIdAndDelete(id);


  await User.findByIdAndUpdate(userId, {
    $pull: { productsOwned: product._id }
  });


  await Category.findByIdAndUpdate(product.cat, {
    $pull: { prodList: product._id }
  });

  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

export const getUserProducts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const products = await Product.find({ ownedBy: userId });

  res.status(200).json({ success: true, products });
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });

  res.status(200).json({ success: true, products });
});
