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

  try {
    // ensure cat -> array
    const categories = Array.isArray(cat) ? cat : [cat];

    //to cloudinary
    const uploadedMedia = await Promise.all(files.map(file => uploadOnCloudinary(file.path)));
    const mediaUrls = uploadedMedia.map(file => file.secure_url);

    // find or create categories and get their IDs
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
      ownedBy: userId,
      status: true,
    });

    await product.save();

    //update
    await User.findByIdAndUpdate(userId, { $push: { productsOwned: product._id } });

    // update the prodList array 
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

    // deleteMedia is always treated as an array
    const mediaToDelete = Array.isArray(deleteMedia) ? deleteMedia : [deleteMedia];

    // public IDs from deleteMedia URLs and delete files from Cloudinary
    await Promise.all(mediaToDelete.map(async (url) => {
      const publicId = extractPublicId(url);
      const isRaw = !/\.\w+$/.test(url); // if the URL contains an extension (means not raw)
      await deleteFromCloudinary(publicId, isRaw);
      // remove from product's media array
      product.media = product.media.filter(mediaUrl => mediaUrl !== url);
    }));

    // cat is always sent as an array
    const categories = Array.isArray(cat) ? cat : [cat];

    //  new media files to Cloudinary
    const uploadedMedia = await Promise.all(newFiles.map(file => uploadOnCloudinary(file.path)));
    const mediaUrls = uploadedMedia.map(file => file.secure_url);

    // find or create categories and get their IDs
    const categoryIds = await Promise.all(categories.map(async (categoryName) => {
      let category = await Category.findOne({ prodType: categoryName });
      if (!category) {
        category = new Category({ prodType: categoryName });
        await category.save();
      }
      return category._id;
    }));

    // update product media with the new files
    product.media = [...product.media, ...mediaUrls];

    product.pName = pName || product.pName;
    product.desc = desc || product.desc;
    product.price = price || product.price;
    product.cat = categoryIds;

    await product.save();

    // user's productsOwned 
    if (!req.user.productsOwned.includes(product._id)) {
      await User.findByIdAndUpdate(userId, { $push: { productsOwned: product._id } });
    }

    //prodList array 
    await Promise.all(categoryIds.map(async (categoryId) => {
      await Category.findByIdAndUpdate(categoryId, { $addToSet: { prodList: product._id } });
    }));

    // remove product ID from prodList 
    const oldCategories = await Category.find({ _id: { $nin: categoryIds } });
    await Promise.all(oldCategories.map(async (oldCategory) => {
      await Category.findByIdAndUpdate(oldCategory._id, { $pull: { prodList: product._id } });
    }));

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while updating the product" });
  }
});

// function to extract public ID from Cloudinary URL
function extractPublicId(url) {
  const parts = url.split('/');
  const publicIdWithFormat = parts[parts.length - 1];
  const publicIdParts = publicIdWithFormat.split('.');
  return publicIdParts[0];
}




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
