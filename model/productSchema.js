import mongoose from "mongoose";

const productSchema = mongoose.Schema(
	{
		productName: {
			type: String,
			required: [true, "Product name is required"],
			unique: true,
			minLength: [3, "Product name must be at least 3 characters long"],
			maxLength: [100, "Product name must not exceed 100 characters"],
			trim: true,
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			minLength: [10, "Description must be at least 10 characters long"],
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: [true, "Category is required"],
		},
		brand: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Brands",
			required: [true, "Brand is required"],
		},
		gender: {
			type: String,
			enum: {
				values: ["Men", "Women", "Kids"],
				message: "Gender must be either Men, Women, or Kids",
			},
			required: [true, "Gender is required"],
		},
		regularPrice: {
			type: Number,
			required: [true, "Regular price is required"],
			min: [0, "Price must be a positive number"],
		},
		salePrice: {
			type: Number,
			min: [0, "Sale price must be a positive number"],
			validate: {
				validator: function (value) {
					return value <= this.regularPrice;
				},
				message: "Sale price should be less than or equal to regular price",
			},
		},
		offer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Offer",
		},
		sizes: [
			{
				size: {
					type: String,
					required: [true, "Size is required"],
					match: [/^[a-zA-Z0-9]+$/, "Invalid size format"],
				},
				stock: {
					type: Number,
					required: [true, "Stock is required for each size"],
					min: [0, "Stock cannot be negative"],
				},
			},
		],
		thumbnail: {
			type: String,
			required: [true, "Thumbnail image is required"],
			validate: {
				validator: function (value) {
					const urlRegex = /^(https?:\/\/)[\w.-]+\.[a-zA-Z]{2,}\/?.*$/;
					return urlRegex.test(value);
				},
				message: "Thumbnail must be a valid URL",
			},
		},
		gallery: [
			{
				type: String,
				validate: {
					validator: function (value) {
						const urlRegex = /^(https?:\/\/)[\w.-]+\.[a-zA-Z]{2,}\/?.*$/;
						return urlRegex.test(value);
					},
					message: "Each gallery image must be a valid URL",
				},
			},
		],
		status: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

productSchema.index({ productName: 1 }, { unique: true });

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

productSchema.pre("save", async function (next) {
	if (this.productName) {
		this.productName = capitalizeFirstLetter(this.productName);
	}

	if (this.isNew || this.isModified("productName")) {
		const existingProduct = await Products.findOne({
			productName: this.productName,
		});
		if (existingProduct) {
			const error = new Error("Product with this name already exists");
			error.code = 11000;
			return next(error);
		}
	}

	next();
});

const Products = mongoose.model("Products", productSchema);

export default Products;
