import mongoose from "mongoose";

const whishListSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Products",
			},
		],
	},
	{ timestamps: true }
);

const WishList = mongoose.model("Wishlist", whishListSchema);

export default WishList;
