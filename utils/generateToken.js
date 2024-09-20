import jwt from "jsonwebtoken";

export const generateToken = (res, user) => {
	const token = jwt.sign(
		{ id: user._id, role: user.role, name: user.name },
		process.env.SECRET_KEY,
		{ expiresIn: "5h" }
	);

	res.cookie("jwtToken", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 5 * 60 * 60 * 1000,
		sameSite: "None",
	});
};
