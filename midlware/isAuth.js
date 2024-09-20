// import jwt from "jsonwebtoken";
// import User from "../model/userScheema.js";

// const isAuth = async (req, res, next) => {
// 	const token = req.cookies.jwtToken;
// 	if (!token) {
// 		return res
// 			.status(401)
// 			.json({ message: "No token provided, authorization denied" });
// 	}
// 	try {
// 		const decoded = jwt.verify(token, process.env.SECRET_KEY);
// 		req.user = decoded;
// 		const user = await User.findById(decoded.id);
// 		if (user.isVerified === false) {
// 			console.log("falseeee");
// 			return res.status(401).json({ message: "User blocked" });
// 		}
// 		next();
// 	} catch (error) {
// 		return res.status(401).json({ message: "Token is not valid" });
// 	}
// };

// const isAuthAdmin = (req, res, next) => {
// 	if (req.user && req.user.role === "admin") {
// 		next();
// 	} else {
// 		console.log(req.user);
// 		res.status(401).json({ message: "Not authorized as an admin" });
// 	}
// };

// export { isAuth, isAuthAdmin };

import jwt from "jsonwebtoken";
import User from "../model/userScheema.js";

const isAuth = async (req, res, next) => {
	const token = req.cookies.jwtToken;

	// Log the received token
	console.log("Received Token:", token);

	if (!token) {
		return res
			.status(401)
			.json({ message: "No token provided, authorization denied" });
	}

	try {
		const decoded = jwt.verify(token, process.env.SECRET_KEY);
		req.user = decoded;

		// Log the decoded user information
		console.log("Decoded User:", req.user);

		const user = await User.findById(decoded.id);

		// Check if user exists
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if user is verified
		if (user.isVerified === false) {
			console.log("User is blocked");
			return res.status(401).json({ message: "User blocked" });
		}

		next();
	} catch (error) {
		console.error("Token verification error:", error);
		return res.status(401).json({ message: "Token is not valid" });
	}
};

const isAuthAdmin = (req, res, next) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		console.log("Unauthorized access attempt:", req.user);
		res.status(401).json({ message: "Not authorized as an admin" });
	}
};

export { isAuth, isAuthAdmin };
