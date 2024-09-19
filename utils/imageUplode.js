import { v2 as cloudinary } from "cloudinary";

const uploadImage = async (imageUrl, folder, width, height) => {
	try {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
		if (typeof imageUrl !== "string") {
			throw new Error("Invalid imageUrl: expected a string.");
		}
		const result = await cloudinary.uploader.upload(imageUrl, {
			folder: folder,
			transformation: [{ width: width, height: height, crop: "limit" }],
		});
		return result.secure_url;
	} catch (error) {
		console.error("Error uploading image:", error);
		throw error;
	}
};

const uploadMultipleImages = async (imageUrls, folder, width, height) => {
	try {
		if (
			!Array.isArray(imageUrls) ||
			imageUrls.some((url) => typeof url !== "string")
		) {
			throw new Error("Invalid imageUrls: expected an array of strings.");
		}
		const uploadPromises = imageUrls.map((imageUrl) =>
			uploadImage(imageUrl, folder, width, height)
		);
		return await Promise.all(uploadPromises);
	} catch (error) {
		console.error("Error uploading multiple images:", error);
		throw error;
	}
};

export { uploadImage, uploadMultipleImages };
