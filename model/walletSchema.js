import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
	type: { type: String, enum: ["credit", "debit"], required: true },
	amount: { type: Number, required: true },
	date: { type: Date, default: Date.now },
	description: { type: String },
	status: { type: String, enum: ["paid,refund"] },
});

const walletSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		unique: true,
	},
	balance: { type: Number, default: 0 },
	transactions: [transactionSchema],
});

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
