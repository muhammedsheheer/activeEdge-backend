import User from "../model/userScheema.js";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";
import Otp from "../model/otpScheema.js";
import { sendOTPByEmail } from "../utils/emailService.js";
import { generateToken } from "../utils/generateToken.js";
import { client } from "../config/googleConfig.js";
import axios from "axios";

const registerUser = async (req, res) => {
	try {
		const { name, email, phone, password, cPassword, role } = req.body;
		if (!name || !email || !phone || !password || !cPassword) {
			return res.status(400).json({ message: "All fields required" });
		}
		const existUser = await User.findOne({ email });
		if (existUser) {
			return res.status(400).json({ message: "User already exists" });
		}
		if (password !== cPassword) {
			return res.status(400).json({ message: "Passwords do not match" });
		}
		const hashPassword = await bcrypt.hash(password, 10);
		const user = new User({
			name,
			email,
			password: hashPassword,
			phone,
			role,
			isVerified: false,
		});
		const userData = await user.save();

		const otp = otpGenerator.generate(6, {
			digits: true,
			alphabets: false,
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});

		const otpData = new Otp({ email, otp });
		await otpData.save();
		await sendOTPByEmail(email, otp);
		return res
			.status(200)
			.json({ message: "User registration successful", userData });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const verifiOtp = async (req, res) => {
	try {
		const { otp } = req.body;

		const otpData = await Otp.findOne({ otp });
		if (!otpData) {
			return res.status(400).json({ message: "Invalid OTP or OTP expired" });
		}

		const user = await User.findOne({ email: otpData.email });
		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		if (user.isVerified) {
			return res.status(400).json({ message: "User already verified" });
		}

		await User.updateOne(
			{ email: otpData.email },
			{ $set: { isVerified: true } }
		);
		await Otp.deleteOne({ otp });

		return res.status(200).json({ message: "OTP verified successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const resendOtp = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email, isVerified: false });
		if (!user) {
			return res
				.status(400)
				.json({ message: "User not found or already verified" });
		}
		await Otp.deleteMany({ email });

		const otp = otpGenerator.generate(6, {
			digits: true,
			alphabets: false,
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});

		const otpData = new Otp({ email, otp });
		await otpData.save();

		await sendOTPByEmail(email, otp);
		return res
			.status(200)
			.json({ message: "New OTP sent successfully, please check your email" });
	} catch (error) {
		return res.status(500).json({ message: "Failed to resend OTP", error });
	}
};

const userLogin = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}
		const userData = await User.findOne({
			email: email,
			isVerified: true,
		});
		if (!userData) {
			return res.status(400).json({ message: "User not found" });
		}
		const matchPassword = await bcrypt.compare(password, userData.password);
		if (!matchPassword) {
			return res.status(400).json({ message: "Invalid password" });
		}
		if (!userData.isVerified) {
			return res.status(400).json({ message: "User not verified" });
		}
		generateToken(res, userData);
		return res.status(200).json({
			message: "Login successful",
			user: userData._id,
			isAuthenticated: true,
			role: userData.role,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const googleLogin = async (req, res) => {
	try {
		const { code } = req.body;
		const { tokens } = await client.getToken(code);

		const googleUser = await axios.get(
			"https://www.googleapis.com/oauth2/v3/userinfo",
			{
				headers: { Authorization: `Bearer ${tokens.access_token}` },
			}
		);

		const { email, given_name } = googleUser.data;

		let user = await User.findOne({ email });
		if (!user) {
			user = new User({
				name: given_name,
				email,
				password: await bcrypt.hash(tokens.id_token, 10),
				isVerified: true,
			});
			await user.save();
		}
		generateToken(res, user);

		const userDataWithoutPassword = {
			user: user._id.toString(),
			name: user.name,
			email: user.email,
			role: user.role,
			isAuthenticated: true,
		};
		console.log("user", userDataWithoutPassword);

		res.status(200).json({
			message: "Google login successful",
			userData: userDataWithoutPassword,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Login failed with Google" });
	}
};

const logout = async (req, res) => {
	try {
		res.cookie("jwtToken", "", {
			httpOnly: true,
			expires: new Date(0),
		});
		req.user = null;
		return res.status(200).json({ message: "Logout successful" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const forgotPassword = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const otp = otpGenerator.generate(6, {
			digits: true,
			alphabets: false,
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});

		const otpData = new Otp({ email, otp });
		await otpData.save();
		await sendOTPByEmail(email, otp);

		res.status(200).json({ message: "OTP sent to email" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const verifyOtpAndResetPassword = async (req, res) => {
	const { email, otp, newPassword, confirmPassword } = req.body;

	try {
		if (newPassword !== confirmPassword) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		const otpData = await Otp.findOne({ email, otp });
		if (!otpData) {
			return res.status(400).json({ message: "Invalid OTP or OTP expired" });
		}

		const hashPassword = await bcrypt.hash(newPassword, 10);
		await User.updateOne(
			{ email: otpData.email },
			{ $set: { password: hashPassword } }
		);

		await Otp.deleteOne({ otp });
		res.status(200).json({ message: "Password reset successful" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// const verifyOtpPassword = async (req, res) => {
// 	const { email, otp } = req.body;

// 	try {
// 		// Check if the OTP is valid
// 		const otpData = await Otp.findOne({ email, otp });
// 		if (!otpData) {
// 			return res.status(400).json({ message: "Invalid OTP or OTP expired" });
// 		}

// 		res.status(200).json({ message: "OTP verified successfully" });
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// };

// const resetPassword = async (req, res) => {
// 	const { email, newPassword, confirmPassword } = req.body;

// 	try {
// 		if (newPassword !== confirmPassword) {
// 			return res.status(400).json({ message: "Passwords do not match" });
// 		}

// 		const otpData = await Otp.findOne({ email });
// 		if (!otpData) {
// 			return res.status(400).json({ message: "Invalid or expired OTP" });
// 		}

// 		const hashPassword = await bcrypt.hash(newPassword, 10);

// 		await User.updateOne(
// 			{ email: otpData.email },
// 			{ $set: { password: hashPassword } }
// 		);

// 		await Otp.deleteOne({ email });

// 		res.status(200).json({ message: "Password reset successful" });
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// };

const resendOtpForgotPassword = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email, isVerified: true });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		await Otp.deleteMany({ email });

		const otp = otpGenerator.generate(6, {
			digits: true,
			alphabets: false,
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});

		const otpData = new Otp({ email, otp });
		await otpData.save();
		await sendOTPByEmail(email, otp);

		res.status(200).json({ message: "New OTP sent to email" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export {
	registerUser,
	verifiOtp,
	resendOtp,
	userLogin,
	logout,
	googleLogin,
	forgotPassword,
	verifyOtpAndResetPassword,
	resendOtpForgotPassword,
};
