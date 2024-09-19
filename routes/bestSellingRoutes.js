import express from "express";
import { isAuth, isAuthAdmin } from "../midlware/isAuth.js";
import {
	getBestSellingBrand,
	getBestSellingCategory,
	getBestSellingProduct,
} from "../controller/bestSellingControl.js";

const router = express.Router();

router.get("/top-selling-products", isAuth, isAuthAdmin, getBestSellingProduct);
router.get(
	"/top-selling-category",
	isAuth,
	isAuthAdmin,
	getBestSellingCategory
);
router.get("/top-selling-brand", isAuth, isAuthAdmin, getBestSellingBrand);

export default router;
