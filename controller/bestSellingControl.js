import Order from "../model/orderSchema.js";
import Products from "../model/productSchema.js";

const getBestSellingProduct = async (req, res) => {
	try {
		const bestSellingProducts = await Order.aggregate([
			{ $unwind: "$items" },
			{
				$group: {
					_id: "$items.productId",
					totalSold: { $sum: "$items.quantity" },
				},
			},
			{ $sort: { totalSold: -1 } },
			{ $limit: 5 },
		]);

		const products = await Products.populate(bestSellingProducts, {
			path: "_id",
		});

		return res.status(200).json({
			message: "Best selling products fetched successfully",
			data: products,
		});
	} catch (error) {
		console.error("Error fetching best selling products:", error);
		return res.status(500).json({ message: error.message });
	}
};

const getBestSellingBrand = async (req, res) => {
	try {
		const bestSellingBrands = await Order.aggregate([
			{ $unwind: "$items" },
			{
				$lookup: {
					from: "products",
					localField: "items.productId",
					foreignField: "_id",
					as: "productDetails",
				},
			},
			{ $unwind: "$productDetails" },
			{
				$lookup: {
					from: "brands",
					localField: "productDetails.brand",
					foreignField: "_id",
					as: "brandDetails",
				},
			},
			{ $unwind: "$brandDetails" },
			{
				$group: {
					_id: "$brandDetails",
					totalSold: { $sum: "$items.quantity" },
				},
			},
			{ $sort: { totalSold: -1 } },
			{ $limit: 5 },
		]);

		return res.status(200).json({
			message: "Best selling brands fetched successfully",
			data: bestSellingBrands,
		});
	} catch (error) {
		console.error("Error fetching best selling brands:", error);
		return res.status(500).json({ message: error.message });
	}
};

const getBestSellingCategory = async (req, res) => {
	try {
		const bestSellingCategories = await Order.aggregate([
			{ $unwind: "$items" },
			{
				$lookup: {
					from: "products",
					localField: "items.productId",
					foreignField: "_id",
					as: "productDetails",
				},
			},
			{ $unwind: "$productDetails" },
			{
				$lookup: {
					from: "categories",
					localField: "productDetails.category",
					foreignField: "_id",
					as: "categoryDetails",
				},
			},
			{ $unwind: "$categoryDetails" },
			{
				$group: {
					_id: "$categoryDetails",
					totalSold: { $sum: "$items.quantity" },
				},
			},
			{ $sort: { totalSold: -1 } },
			{ $limit: 5 },
		]);

		return res.status(200).json({
			message: "Best selling categories fetched successfully",
			data: bestSellingCategories,
		});
	} catch (error) {
		console.error("Error fetching best selling categories:", error);
		return res.status(500).json({ message: error.message });
	}
};

export { getBestSellingProduct, getBestSellingCategory, getBestSellingBrand };
