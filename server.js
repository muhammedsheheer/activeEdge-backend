// import express, { urlencoded } from "express";
// import cors from "cors";
// import "dotenv/config";
// import appRoutes from "./routes/apiRoutes.js";
// import cookieParser from "cookie-parser";
// import connectDb from "./config/mongodb.js";
// import morgan from "morgan";

// const PORT = process.env.PORT || 5000;
// connectDb();

// const app = express();

// const corsOrigin =
// 	process.env.NODE_ENV === "production"
// 		? "https://active-front-end.vercel.app"
// 		: "http://localhost:3000";

// app.use(
// 	cors({
// 		origin: "*",
// 		credentials: true,
// 	})
// );

// app.use(morgan("dev"));
// app.use(express.json({ limit: "150mb" }));
// app.use(express.urlencoded({ limit: "150mb", extended: true }));
// app.use(cookieParser());
// app.use("/api", appRoutes);

// app.get("/", (req, res) => {
// 	res.json({ message: "Servor is running" });
// });

// app.listen(PORT, () => {
// 	console.log(`Server running at http://localhost:${PORT}`);
// });

import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import appRoutes from "./routes/apiRoutes.js";
import cookieParser from "cookie-parser";
import connectDb from "./config/mongodb.js";
import morgan from "morgan";

const PORT = process.env.PORT || 5000;
connectDb();

const app = express();

const corsOrigin =
	process.env.NODE_ENV === "production"
		? "https://active-edge-client.onrender.com"
		: "http://localhost:3000";

app.use(
	cors({
		origin: corsOrigin,
		credentials: true,
	})
);

app.use(morgan("dev"));
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));
app.use(cookieParser());

app.use("/api", appRoutes);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "front-end/build")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "front-end/build", "index.html"));
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
