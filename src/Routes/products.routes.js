import express from "express";
import multer from "multer";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  getAllProducts,
} from "../controllers/products.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); 

router.post("/",  upload.array('media', 10), createProduct); 
router.put("/:id",  upload.array('newMedia', 10), updateProduct); 
router.delete("/:id",  deleteProduct);
router.get("/user",  getUserProducts);
router.get("/", getAllProducts);

export default router;