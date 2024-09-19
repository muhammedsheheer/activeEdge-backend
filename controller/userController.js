import User from "../model/userScheema.js";
import { uploadImage } from "../utils/imageUplode.js";

const getAllUser = async (req, res) => {
	try {
		const users = await User.find({ role: "user" }).select("-password");
		if (!users) {
			return res.status(400).json({ message: "User not found" });
		}
		return res.status(200).json({ message: "User fetched sucessfully", users });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getUserDetails = async (req, res) => {
	try {
		const userId = req.user;

		const userData = await User.findById(userId.id).select("-password");
		if (!userData) {
			return res.status(500).json({ message: "User not found" });
		}
		return res
			.status(200)
			.json({ message: "User details fetched successfully", user: userData });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const blockUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		if (!user) {
			return res.status(500).json({ message: "User not found" });
		}
		user.isVerified = !user.isVerified;
		await user.save();
		const message = user.isVerified ? "activated" : "blocked";
		return res
			.status(200)
			.json({ message: `User ${message} successfully`, user });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		await User.findByIdAndDelete(id);
		return res.status(200).json({ message: "Deleted successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateUserDetails = async (req, res) => {
	try {
		const userId = req.user;
		const { name, phone, dpImage } = req.body;
		const user = await User.findById(userId.id);
		if (!user) {
			return res.status(400).json({ message: "User not founded" });
		}
		user.name = name || user.name;
		user.phone = phone || user.phone;
		if (dpImage) {
			user.dpImage = await uploadImage(dpImage, "profileImage", 600, 600);
		}
		const updateUser = await user.save();
		return res
			.status(200)
			.json({ message: "Updated successfully", user: updateUser });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const addAddress = async (req, res) => {
	try {
		const userId = req.user.id;
		const {
			name,
			phone,
			address,
			locality,
			city,
			state,
			pinCode,
			typeofPlace,
			isDefaultAddress,
		} = req.body;

		if (
			!name ||
			!phone ||
			!address ||
			!locality ||
			!city ||
			!state ||
			!typeofPlace ||
			!pinCode
		) {
			return res
				.status(400)
				.json({ message: "All required fields must be provided" });
		}
		const normalizedTypeofPlace = typeofPlace.toLowerCase();
		const user = await User.findById(userId).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (isDefaultAddress) {
			user.addresses.forEach((address) => (address.isDefaultAddress = false));
		}

		user.addresses.push({
			name,
			phone,
			address,
			locality,
			city,
			state,
			pinCode,
			typeofPlace: normalizedTypeofPlace,
			isDefaultAddress,
		});

		await user.save();
		console.log(user);

		return res
			.status(200)
			.json({ message: "Address added successfully", user });
	} catch (error) {
		console.log(error);

		return res.status(500).json({ message: "some problem" });
	}
};

const getAddress = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not founded" });
		}
		const sortedAddress = user.addresses.sort((a, b) => {
			return b.isDefaultAddress - a.isDefaultAddress;
		});
		return res.status(200).json({
			message: "Address fetched successfully",
			addresses: sortedAddress,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const removeAddress = async (req, res) => {
	try {
		const userId = req.user.id;
		const { addressId } = req.params;
		const user = await User.findByIdAndUpdate(
			userId,
			{ $pull: { addresses: { _id: addressId } } },
			{ new: true }
		);
		return res.status(200).json({ message: "Address romoved successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const editAddress = async (req, res) => {
	try {
		const userId = req.user.id;
		const { addressId } = req.params;
		const {
			name,
			phone,
			address,
			locality,
			city,
			state,
			pinCode,
			typeofPlace,
			isDefaultAddress,
		} = req.body;

		if (
			!name ||
			!phone ||
			!address ||
			!locality ||
			!city ||
			!state ||
			!typeofPlace ||
			!pinCode
		) {
			return res
				.status(400)
				.json({ message: "All required fields must be provided" });
		}

		const normalizedTypeofPlace = typeofPlace.toLowerCase();
		const user = await User.findById(userId).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const addressIndex = user.addresses.findIndex(
			(addr) => addr._id.toString() === addressId
		);

		if (addressIndex === -1) {
			return res.status(404).json({ message: "Address not found" });
		}

		user.addresses[addressIndex] = {
			...user.addresses[addressIndex],
			name,
			phone,
			address,
			locality,
			city,
			state,
			pinCode,
			typeofPlace: normalizedTypeofPlace,
			isDefaultAddress,
		};

		if (isDefaultAddress) {
			user.addresses.forEach((addr, index) => {
				if (index !== addressIndex) {
					addr.isDefaultAddress = false;
				}
			});
		}

		await user.save();

		return res
			.status(200)
			.json({ message: "Address updated successfully", user });
	} catch (error) {
		console.log(error);

		return res.status(500).json({ message: error.message });
	}
};

export {
	getAllUser,
	getUserDetails,
	blockUser,
	deleteUser,
	updateUserDetails,
	addAddress,
	getAddress,
	removeAddress,
	editAddress,
};
