import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
	{
		categoryName: {
			type: String,
			required: true,
			unique: true,
		},
		description: {
			type: String,
		},
		status: {
			type: Boolean,
			required: true,
			default: true,
		},
		offer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Offer",
		},
	},
	{
		timestamps: true,
	}
);

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

categorySchema.pre("save", function (next) {
	if (this.categoryName) {
		this.categoryName = capitalizeFirstLetter(this.categoryName);
	}
	next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
