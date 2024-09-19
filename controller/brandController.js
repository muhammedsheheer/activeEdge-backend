import Brands from "../model/brandSchema.js";
import { uploadImage } from "../utils/imageUplode.js";

const createBrand = async (req, res) => {
	try {
		const { brandName, brandTitle, logo } = req.body;

		const logoUrl = await uploadImage(logo, "mybrandImages", 200, 200, "fill");

		if (!brandName) {
			return res.status(400).json({ message: "Brand name is required" });
		}

		const existingBrand = await Brands.findOne({ brandName });
		if (existingBrand) {
			return res.status(400).json({ message: "Brand already exists" });
		}

		const brand = new Brands({
			brandName,
			brandTitle,
			logo: logoUrl,
		});

		await brand.save();
		return res.status(200).json({ message: "Brand added successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getBrands = async (req, res) => {
	try {
		const brandData = await Brands.find();
		return res.status(200).json({ message: "Brand data fetched", brandData });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const editBrand = async (req, res) => {
	try {
		const { brandId, brandName, brandTitle, logo } = req.body;

		if (!brandId) {
			return res.status(400).json({ message: "Brand ID is required" });
		}

		const brand = await Brands.findById(brandId);
		if (!brand) {
			return res.status(404).json({ message: "Brand not found" });
		}

		if (brandName) {
			const existingBrand = await Brands.findOne({
				brandName,
				_id: { $ne: brandId },
			});
			if (existingBrand) {
				return res.status(400).json({ message: "Brand name already in use" });
			}
			brand.brandName = brandName;
		}

		if (brandTitle) {
			brand.brandTitle = brandTitle;
		}

		if (logo) {
			const logoUrl = await uploadImage(
				logo,
				"mybrandImages",
				200,
				200,
				"fill"
			);
			brand.logo = logoUrl;
		}

		await brand.save();
		return res
			.status(200)
			.json({ message: "Brand updated successfully", brand });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const removeBrand = async (req, res) => {
	try {
		const { brandId } = req.params;
		console.log(req.params);

		if (!brandId) {
			return res.status(400).json({ message: "Brand ID is required" });
		}

		const brand = await Brands.findById(brandId);
		if (!brand) {
			return res.status(404).json({ message: "Brand not found" });
		}

		await Brands.findByIdAndDelete(brandId);
		return res.status(200).json({ message: "Brand removed successfully" });
	} catch (error) {
		console.log(error);

		return res.status(500).json({ message: error.message });
	}
};

export { createBrand, getBrands, editBrand, removeBrand };
