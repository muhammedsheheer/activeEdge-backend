// import WishList from "../model/wishListScheema.js";

// const handleToggleWishlist = async (req, res) => {
// 	try {
// 		const { userId, productId } = req.body;
// 		let wishlist = await WishList.findOne({ userId });
// 		if (!wishlist) {
// 			wishlist = new WishList({ userId, products: [] });
// 		}
// 		const productIndex = wishlist.products.indexOf(productId);

// 		if (productIndex > -1) {
// 			wishlist.products.splice(productIndex, 1);
// 		} else {
// 			wishlist.products.push(productId);
// 		}

// 		await wishlist.save();
// 		return res.status(200).json({ wishlist });
// 	} catch (error) {
// 		return res.status(500).json({ message: error.message });
// 	}
// };

// const getWishlist = async (req, res) => {
// 	try {
// 		const userId = req.params.userId;
// 		const wishlist = await WishList.findOne({ userId }).populate("products");
// 		return res.status(200).json({ wishlist });
// 	} catch (error) {
// 		return res.status(200).json({ message: error.message });
// 	}
// };

// export { handleToggleWishlist, getWishlist };

import WishList from "../model/wishListScheema.js";

const handleToggleWishlist = async (req, res) => {
	try {
		const { userId, productId } = req.body;

		let wishlist = await WishList.findOne({ userId });

		if (!wishlist) {
			wishlist = new WishList({ userId, products: [] });
		}
		const productIndex = wishlist.products.indexOf(productId);

		if (productIndex > -1) {
			wishlist.products.splice(productIndex, 1);
		} else {
			wishlist.products.push(productId);
		}

		await wishlist.save();

		return res.status(200).json({ wishlist });
	} catch (error) {
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

const getWishlist = async (req, res) => {
	try {
		const userId = req.params.userId;
		const wishlist = await WishList.findOne({ userId }).populate("products");

		if (!wishlist) {
			return res.status(404).json({ message: "Wishlist not found" });
		}
		return res.status(200).json({ wishlist });
	} catch (error) {
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

export { handleToggleWishlist, getWishlist };
