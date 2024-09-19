import mongoose from "mongoose";

const brandSchema = mongoose.Schema(
	{
		brandName: {
			type: String,
			required: true,
			unique: true,
		},
		brandTitle: {
			type: String,
			required: false,
		},
		logo: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

brandSchema.pre("save", function (next) {
	if (this.brandName) {
		this.brandName = capitalizeFirstLetter(this.brandName);
	}
	next();
});

const Brands = mongoose.model("Brands", brandSchema);

export default Brands;
