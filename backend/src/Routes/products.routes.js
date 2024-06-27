import express from "express";
import multer from "multer";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  getAllProducts,
  getProductById,
  getProductByCategory,
  SetStatus
} from "../controllers/products.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); 

router.post("/NewProduct", verifyJWT, upload.array('media', 10), createProduct); //tested
router.put("/:id", verifyJWT, upload.array('newMedia', 10), updateProduct); //tested
router.delete("/:id", verifyJWT, deleteProduct);//tested
router.get("/user", verifyJWT, getUserProducts);//tested
router.get("/", getAllProducts);//tested
router.get("/:id", getProductById);//tested
router.patch("/:id",SetStatus);
router.get('/category/:categoryName', getProductByCategory); // tested

export default router;
