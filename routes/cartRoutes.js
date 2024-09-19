import express from "express";
import {
	addToCart,
	clearCart,
	getToCart,
	removeToCart,
	updateToCart,
} from "../controller/cartController.js";
import { isAuth } from "../midlware/isAuth.js";
const router = express.Router();

router.post("/add-to-cart", isAuth, addToCart);
router.get("/get-to-cart", isAuth, getToCart);
router.delete("/remove-to-cart/:productId", isAuth, removeToCart);
router.put("/update-to-cart/:productId", isAuth, updateToCart);
router.delete("/clear-to-cart", isAuth, clearCart);

export default router;
