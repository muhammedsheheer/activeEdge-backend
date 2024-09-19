import express from "express";
import {
	addMoney,
	createWallet,
	getWallet,
} from "../controller/walletController.js";
import { isAuth } from "../midlware/isAuth.js";

const router = express.Router();

router.get("/get-wallet", isAuth, getWallet);
router.post("/create-wallet", isAuth, createWallet);
router.post("/add-money", isAuth, addMoney);

export default router;
