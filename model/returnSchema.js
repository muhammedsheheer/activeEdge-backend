import mongoose from "mongoose";

const returnSchema = new mongoose.Schema({
	orderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Order",
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	productId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Products",
		required: true,
	},
	size: {
		type: String,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
	},
	reason: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ["Pending", "Accepted", "Rejected"],
		default: "Pending",
	},
	itemId: {
		type: String,
	},

	returnDate: {
		type: Date,
		default: Date.now,
	},
});

const Return = mongoose.model("Return", returnSchema);
export default Return;
