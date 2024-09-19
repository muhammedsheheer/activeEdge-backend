import nodemailer from "nodemailer";

export const sendOTPByEmail = async (email, otp) => {
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	try {
		let info = await transporter.sendMail({
			from: `"Active Edge" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: "OTP for Registration",
			text: `Your OTP is: ${otp}. It will expire in 1 minute.`,
			html: `<b>Your OTP is: ${otp}</b><br>It will expire in 1 minute.`,
		});
		console.log("Email sent: %s", info.messageId);
	} catch (error) {
		console.error("Error sending email:", error.message);
	}
};
