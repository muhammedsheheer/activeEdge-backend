import mongoose from "mongoose";

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		phone: {
			type: Number,
		},
		password: {
			type: String,
		},
		role: {
			type: String,
			default: "user",
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		dpImage: { type: String, required: false },
		addresses: [
			{
				name: {
					type: String,
				},
				phone: {
					type: Number,
					required: true,
				},
				address: {
					type: String,
					required: true,
				},
				locality: {
					type: String,
					required: true,
				},
				city: {
					type: String,
					required: true,
				},
				state: {
					type: String,
					required: true,
				},
				pinCode: {
					type: Number,
				},
				typeofPlace: {
					type: String,
					enum: ["home", "work"],
					default: "home",
				},
				isDefaultAddress: {
					type: Boolean,
					default: false,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);

export default User;
