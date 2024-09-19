import express from "express";
import {
	registerUser,
	verifiOtp,
	resendOtp,
	userLogin,
	logout,
	googleLogin,
	forgotPassword,
	verifyOtpAndResetPassword,
	resendOtpForgotPassword,
} from "../controller/authController.js";
import { isAuth, isAuthAdmin } from "../midlware/isAuth.js";
import {
	addAddress,
	blockUser,
	deleteUser,
	editAddress,
	getAddress,
	getAllUser,
	getUserDetails,
	removeAddress,
	updateUserDetails,
} from "../controller/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifiOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", userLogin);
router.post("/google-login", googleLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp-reset-password", verifyOtpAndResetPassword);
router.post("/resend-otp-password", resendOtpForgotPassword);

//user routes

router.get("/getAllUser", isAuth, isAuthAdmin, getAllUser);
router.get("/getUserDetails", isAuth, getUserDetails);
router.put("/blockUser/:id", isAuth, isAuthAdmin, blockUser);
router.put("/updateUserDetails", isAuth, updateUserDetails);
router.delete("/deleteUser/:id", isAuth, isAuthAdmin, deleteUser);

//user address routes
router.post("/add-address", isAuth, addAddress);
router.get("/get-address", isAuth, getAddress);
router.delete("/remove-address/:addressId", isAuth, removeAddress);
router.put("/edit-address/:addressId", isAuth, editAddress);

export default router;
