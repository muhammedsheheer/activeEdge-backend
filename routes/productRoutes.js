import express from "express";
import { isAuth, isAuthAdmin } from "../midlware/isAuth.js";
import {
	blockProduct,
	createProduct,
	delteProduct,
	getProductByGender,
	getProductById,
	getProducts,
	updateProduct,
} from "../controller/productController.js";

const router = express.Router();

router.post("/createProduct", isAuth, isAuthAdmin, createProduct);
router.get("/getProducts", getProducts);
router.get("/productDetails/:id", getProductById);
router.get("/productByGender-query", getProductByGender);
router.put("/productEdit/:id", isAuth, isAuthAdmin, updateProduct);
router.put("/productActivate/:id", isAuth, isAuthAdmin, blockProduct);
router.delete("/productDelete/:id", isAuth, isAuthAdmin, delteProduct);

export default router;
