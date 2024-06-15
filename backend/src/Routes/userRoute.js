import { Router } from "express";
import { ExtractCart, LoginUser, LogoutUser, refreshAccesToken, registerUser,RetrieveUser,WishListFetch } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/register").post(registerUser)
router.route("/logging").post(LoginUser)
router.route("/WishList").get(verifyJWT,WishListFetch)
router.route("/ExtractCart").get(verifyJWT,ExtractCart);

router.route("/logout").post(verifyJWT,LogoutUser);
router.route("/protectedRoute").post(verifyJWT,RetrieveUser);
router.route("/RefreshToken").post(refreshAccesToken);

export default router;