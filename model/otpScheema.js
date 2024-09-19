import mongoose from "mongoose";

const otpScheema = mongoose.Schema({
	email: {
		type: String,
		required: false,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
		expires: 60,
	},
});

const Otp = mongoose.model("Otp", otpScheema);
export default Otp;
