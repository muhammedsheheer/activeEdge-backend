import express from "express";
import { isAuth, isAuthAdmin } from "../midlware/isAuth.js";
import {
	createCategory,
	deleteCategory,
	editCategory,
	getAllCategory,
} from "../controller/categoryController.js";

const router = express.Router();

router.post("/createCategory", isAuth, isAuthAdmin, createCategory);
router.get("/getCategories", isAuth, isAuthAdmin, getAllCategory);
router.put("/updateCategory/:id", isAuth, isAuthAdmin, editCategory);
router.delete("/deleteCategory/:id", isAuth, isAuthAdmin, deleteCategory);

export default router;
