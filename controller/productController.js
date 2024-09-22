import Products from "../model/productSchema.js";
import { uploadImage, uploadMultipleImages } from "../utils/imageUplode.js";
import { calculateOfferPrice } from "../utils/calculateOfferPrice.js";

const createProduct = async (req, res) => {
	try {
		const {
			thumbnail,
			galleryImages,
			productName,
			description,
			category,
			brand,
			gender,
			regularPrice,
			salePrice,
			sizes,
			status,
		} = req.body;

		if (
			!productName ||
			!description ||
			!category ||
			!brand ||
			!gender ||
			!regularPrice ||
			!salePrice ||
			!sizes
		) {
			return res.status(400).json({ message: "All fields are required" });
		}

		let thumbnailUrl;
		let galleryImageUrls = [];

		try {
			thumbnailUrl = await uploadImage(
				thumbnail,
				"myProducts/thumbnail",
				600,
				600
			);
			galleryImageUrls = await uploadMultipleImages(
				galleryImages,
				"myProducts/gallery",
				600,
				600
			);
		} catch (imageError) {
			return res
				.status(500)
				.json({ message: "Image upload failed", error: imageError });
		}

		const newProduct = new Products({
			productName,
			description,
			category,
			brand,
			gender,
			regularPrice,
			salePrice,
			sizes,
			thumbnail: thumbnailUrl,
			gallery: galleryImageUrls,
			status,
		});

		const product = await newProduct.save();
		return res
			.status(200)
			.json({ message: "Product added Successfully", product });
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ message: "Product already exists" });
		} else {
			return res.status(500).json({ message: error.message });
		}
	}
};

const getProducts = async (req, res) => {
	try {
		const products = await Products.find({})
			.populate("category")
			.populate("brand")
			.populate("offer")
			.populate({
				path: "category",
				populate: { path: "offer" },
			})
			.sort({ createdAt: -1 })
			.limit(12);

		const results = products.map((product) => {
			const productOffer = product.offer?.discountPercentage || 0;
			const categoryOffer = product.category?.offer?.discountPercentage || 0;
			const offerExpirationDate =
				product.offer?.endDate || product.category?.offer?.endDate;
			const priceDetails = calculateOfferPrice(
				product.salePrice,
				productOffer,
				categoryOffer,
				offerExpirationDate
			);
			return {
				...product.toObject(),
				...priceDetails,
				offerValid: priceDetails.offerPercentage > 0,
			};
		});
		return res
			.status(200)
			.json({ message: "prodduct fetched successfully", products: results });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getProductByGender = async (req, res) => {
	try {
		const { gender } = req.query;
		const query = gender ? { gender } : {};
		const products = await Products.find(query)
			.populate("category")
			.populate("brand")
			.populate("offer")
			.populate({
				path: "category",
				populate: { path: "offer" },
			})
			.sort({ createdAt: -1 });
		if (!products) {
			return res.status(400).json({ message: "No item founded" });
		}

		const results = products.map((product) => {
			const productOffer = product.offer?.discountPercentage || 0;
			const categoryOffer = product.category?.offer?.discountPercentage || 0;
			const offerExpirationDate =
				product.offer?.endDate || product.category?.offer?.endDate;
			const priceDetails = calculateOfferPrice(
				product.salePrice,
				productOffer,
				categoryOffer,
				offerExpirationDate
			);
			return {
				...product.toObject(),
				...priceDetails,
				offerValid: priceDetails.offerPercentage > 0,
			};
		});
		return res
			.status(200)
			.json({ message: "Product fetched successfully", products: results });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getProductById = async (req, res) => {
	try {
		const { id } = req.params;
		const productsDetails = await Products.findById(id)
			.populate("category")
			.populate("brand")
			.populate("offer")
			.populate({
				path: "category",
				populate: { path: "offer" },
			});
		if (!productsDetails) {
			return res.status(400).json({ message: "Product not found" });
		}

		const productOffer = productsDetails.offer?.discountPercentage || 0;
		const categoryOffer =
			productsDetails.category?.offer?.discountPercentage || 0;
		const offerExpirationDate =
			productsDetails.offer?.endDate ||
			productsDetails.category?.offer?.endDate;
		const priceDetails = calculateOfferPrice(
			productsDetails.salePrice,
			productOffer,
			categoryOffer,
			offerExpirationDate
		);

		return res.status(200).json({
			message: "Product fetch successfully",
			productsDetails,
			...priceDetails,
			offerValid: priceDetails.offerPercentage > 0,
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to get the product" });
	}
};

const updateProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			thumbnail,
			galleryImages,
			productName,
			description,
			category,
			brand,
			gender,
			regularPrice,
			salePrice,
			sizes,
			status,
		} = req.body;
		const product = await Products.findById(id);

		if (!product) {
			return res.status(400).json({ message: "Product not found" });
		}
		(product.productName = productName || product.productName),
			(product.description = description || product.description),
			(product.category = category || product.category),
			(product.brand = brand || product.brand),
			(product.gender = gender || product.gender);
		(product.regularPrice =
			regularPrice !== undefined ? regularPrice : product.regularPrice),
			(product.salePrice =
				salePrice !== undefined ? salePrice : product.salePrice),
			(product.sizes = sizes || product.sizes),
			(product.status = status !== undefined ? status : product.status);

		const isCloudinaryUrl = (url) =>
			url.startsWith("https://res.cloudinary.com");

		if (thumbnail && !isCloudinaryUrl(thumbnail)) {
			product.thumbnail = await uploadImage(
				thumbnail,
				"myProducts/thumbnail",
				600,
				600
			);
		}

		if (galleryImages) {
			const imagesToUpload = galleryImages.filter(
				(image) => !isCloudinaryUrl(image)
			);

			if (imagesToUpload.length > 0) {
				product.gallery = await uploadMultipleImages(
					imagesToUpload,
					"myProducts/thumbnail",
					600,
					600
				);
			}
		}

		const updatedProduct = await product.save();
		return res
			.status(200)
			.json({ message: "Updated Successfully", product: updatedProduct });
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ message: "Product already exists" });
		} else {
			return res.status(500).json({ message: error.message });
		}
	}
};

const blockProduct = async (req, res) => {
	try {
		const { status } = req.body;
		const { id } = req.params;
		const product = await Products.findById(id);
		if (!product) {
			return res.status(400).json({ message: "Product not founded" });
		}
		product.status = !product.status;
		await product.save();
		const productStatusMessage = product.status ? "Active" : "Blocked";
		return res
			.status(200)
			.json({ message: `product is ${productStatusMessage}`, product });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const delteProduct = async (req, res) => {
	try {
		const { id } = req.params;
		await Products.findByIdAndDelete(id);
		return res.status(200).json({ message: "Product deleted successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export {
	getProducts,
	createProduct,
	getProductByGender,
	getProductById,
	delteProduct,
	blockProduct,
	updateProduct,
};
