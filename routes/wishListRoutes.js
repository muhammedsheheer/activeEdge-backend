import express from "express";
import {
	handleToggleWishlist,
	getWishlist,
} from "../controller/wishListController.js";
import { isAuth } from "../midlware/isAuth.js";

const router = express.Router();

router.post("/handle-wishlist", isAuth, handleToggleWishlist);
router.get("/get-wishlist/:userId", getWishlist);

export default router;
