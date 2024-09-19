// import mongoose from "mongoose";

// const connectDb = async () => {
// 	await mongoose
// 		.connect(process.env.MONGO_URI)
// 		.then(() => console.log("Connected to MongoDB!"))
// 		.catch((err) => {
// 			console.error("Error connecting to MongoDB:", err);
// 			process.exit(1);
// 		});
// };

// export default connectDb;

import mongoose from "mongoose";

const connectDb = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB!");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1);
	}
};

export default connectDb;
