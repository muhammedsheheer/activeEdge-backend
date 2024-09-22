import express from "express";
import { isAuth, isAuthAdmin } from "../midlware/isAuth.js";
import {
	createBrand,
	editBrand,
	getBrands,
	removeBrand,
} from "../controller/brandController.js";

const router = express.Router();

router.post("/createBrand", isAuth, isAuthAdmin, createBrand);
router.get("/getbrands", getBrands);
router.put("/edit-brand/:brandId", isAuth, isAuthAdmin, editBrand);
router.delete("/delete-brand/:brandId", isAuth, isAuthAdmin, removeBrand);

export default router;
