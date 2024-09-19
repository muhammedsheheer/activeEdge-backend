import mongoose from "mongoose";

const coupenSchema = new mongoose.Schema({
	code: {
		type: String,
		required: true,
		unique: true,
	},
	discountPercentage: {
		type: Number,
		required: true,
	},
	expiryDate: {
		type: Date,
		required: true,
	},
	minimumPurchaseAmount: {
		type: Number,
		required: true,
	},
	maxDiscountAmount: {
		type: Number,
		required: true,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	usedBy: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
});

const Coupen = mongoose.model("Coupen", coupenSchema);
export default Coupen;
