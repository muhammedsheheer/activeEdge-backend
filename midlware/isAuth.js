import jwt from "jsonwebtoken";
import User from "../model/userScheema.js";

const isAuth = async (req, res, next) => {
	const token = req.cookies.jwtToken;
	if (!token) {
		return res
			.status(401)
			.json({ message: "No token provided, authorization denied" });
	}
	try {
		const decoded = jwt.verify(token, process.env.SECRET_KEY);
		req.user = decoded;
		const user = await User.findById(decoded.id);
		if (user.isVerified === false) {
			console.log("falseeee");
			return res.status(401).json({ message: "User blocked" });
		}
		next();
	} catch (error) {
		return res.status(401).json({ message: "Token is not valid" });
	}
};

const isAuthAdmin = (req, res, next) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		console.log(req.user);
		res.status(401).json({ message: "Not authorized as an admin" });
	}
};

export { isAuth, isAuthAdmin };
