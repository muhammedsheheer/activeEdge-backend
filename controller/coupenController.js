import Coupen from "../model/coupenSchema.js";

const createCoupen = async (req, res) => {
	try {
		const {
			code,
			discountPercentage,
			expiryDate,
			minimumPurchaseAmount,
			maxDiscountAmount,
		} = req.body;

		const coupen = new Coupen({
			code,
			discountPercentage,
			expiryDate,
			maxDiscountAmount,
			minimumPurchaseAmount,
		});
		await coupen.save();
		res.status(201).json({ message: "Coupen created successfully", coupen });
	} catch (error) {
		console.log(error);

		return res.status(500).json({ message: error.message });
	}
};

const getCoupen = async (req, res) => {
	try {
		const userId = req.user.id;
		const coupens = await Coupen.find({ usedBy: { $ne: userId } });

		return res
			.status(200)
			.json({ message: "Coupen fetched successfully", coupens });
	} catch (error) {
		console.log(error);

		return res.status(500).json({ message: error.message });
	}
};

const editCoupen = async (req, res) => {
	try {
		const { id } = req.params;
		const updatedCoupen = await Coupen.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		return res
			.status(200)
			.json({ message: "Coupen updated successfully", updatedCoupen });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Coupen update successfully", updatedCoupen });
	}
};

const deleteCoupen = async (req, res) => {
	try {
		const { id } = req.params;
		await Coupen.findByIdAndDelete(id);
		return res.status(200).json({ message: "Coupen deleted successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const validateCoupen = async (req, res) => {
	try {
		const { code, purchaseAmount } = req.body;

		const userId = req.user.id;

		const coupen = await Coupen.findOne({ code, isActive: true });

		if (!coupen) {
			return res
				.status(404)
				.json({ message: "Coupon not found or already used" });
		}

		const isExpired = new Date() > new Date(coupen.expiryDate);
		if (isExpired) {
			return res.status(400).json({ message: "Coupon has expired" });
		}

		if (purchaseAmount < coupen.minimumPurchaseAmount) {
			return res.status(400).json({
				message: `Minimum purchase amount for this coupon is ₹${coupen.minimumPurchaseAmount}`,
			});
		}

		const userAlreadyUsed = coupen.usedBy.includes(userId);
		if (userAlreadyUsed) {
			return res
				.status(400)
				.json({ message: "Coupon has already been used by this user" });
		}

		const discountAmount = (coupen.discountPercentage / 100) * purchaseAmount;
		const finalDiscountAmount = Math.min(
			discountAmount,
			coupen.maxDiscountAmount
		);

		coupen.usedBy.push(userId);
		await coupen.save();

		return res.status(200).json({
			message: "Coupon is valid and has been applied",
			discountAmount: finalDiscountAmount,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const unValidateCoupen = async (req, res) => {
	try {
		const { code } = req.body;
		const userId = req.user.id;

		const coupen = await Coupen.findOne({ code });

		if (!coupen) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		coupen.usedBy = coupen.usedBy.filter(
			(id) => id.toString() !== userId.toString()
		);

		await coupen.save();

		return res.status(200).json({ message: "Coupon removed successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const adminGetCoupen = async (req, res) => {
	try {
		const coupens = await Coupen.find();

		return res
			.status(200)
			.json({ message: "Coupen fetched successfully", coupens });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export {
	createCoupen,
	getCoupen,
	editCoupen,
	deleteCoupen,
	validateCoupen,
	adminGetCoupen,
	unValidateCoupen,
};
