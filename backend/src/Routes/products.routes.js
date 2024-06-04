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

router.post("/", verifyJWT, upload.array('media', 10), createProduct); 
router.put("/:id", verifyJWT, upload.array('newMedia', 10), updateProduct); 
router.delete("/:id", verifyJWT, deleteProduct);
router.get("/user", verifyJWT, getUserProducts);
router.get("/", getAllProducts);

export default router;
