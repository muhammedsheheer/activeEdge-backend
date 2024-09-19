import Products from "../model/productSchema.js";
import Category from "../model/categorySchema.js";
import Offer from "../model/offerSchema.js";

const createOffer = async (req, res) => {
	try {
		const {
			name,
			offerType,
			discountPercentage,
			startDate,
			endDate,
			description,
			targetOfferId,
		} = req.body;
		const offer = new Offer({
			name,
			offerType,
			discountPercentage,
			startDate,
			endDate,
			description,
			targetOfferId,
		});
		await offer.save();
		if (offerType === "Category") {
			await Category.findByIdAndUpdate(targetOfferId, { offer: offer._id });
		} else if (offerType === "Products") {
			await Products.findByIdAndUpdate(targetOfferId, { offer: offer._id });
		}

		return res
			.status(201)
			.json({ message: "Offer created successfully", offer });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getOffers = async (req, res) => {
	try {
		const currentDate = new Date();
		const categoryOffersPromise = Offer.find({
			offerType: "Category",
		})
			.populate({
				path: "targetOfferId",
				select: "categoryName description",
				model: "Category",
			})
			.exec();

		const productOffersPromise = Offer.find({
			offerType: "Products",
		})
			.populate({
				path: "targetOfferId",
				select: "productName description price thumbnail",
				model: "Products",
			})
			.exec();
		const [categoryOffer, productOffer] = await Promise.all([
			categoryOffersPromise,
			productOffersPromise,
		]);
		return res
			.status(200)
			.json({ message: "Offer fetched", categoryOffer, productOffer });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export { createOffer, getOffers };
