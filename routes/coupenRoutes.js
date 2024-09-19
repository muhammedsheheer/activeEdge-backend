import express from "express";
import { isAuth, isAuthAdmin } from "../midlware/isAuth.js";
import {
	adminGetCoupen,
	createCoupen,
	deleteCoupen,
	editCoupen,
	getCoupen,
	unValidateCoupen,
	validateCoupen,
} from "../controller/coupenController.js";

const router = express.Router();

router.post("/create-coupen", isAuth, isAuthAdmin, createCoupen);
router.get("/get-coupen", isAuth, getCoupen);
router.put("/update-coupen/:id", isAuth, isAuthAdmin, editCoupen);
router.delete("/delete-coupen/:id", isAuth, isAuthAdmin, deleteCoupen);
router.post("/validate-coupen", isAuth, validateCoupen);
router.get("/admin-get-coupens", isAuth, isAuthAdmin, adminGetCoupen);
router.post("/remove-coupen", isAuth, unValidateCoupen);

export default router;
