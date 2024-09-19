import express from "express";
import { isAuth, isAuthAdmin } from "../midlware/isAuth.js";
import { createOffer, getOffers } from "../controller/offerController.js";

const router = express.Router();

router.post("/create-offer", isAuth, isAuthAdmin, createOffer);
router.get("/get-offer", getOffers);

export default router;
