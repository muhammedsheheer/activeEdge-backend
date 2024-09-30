import mongoose from "mongoose";

const connectDb = async () => {
	try {
		await mongoose.connect(
			process.env.MONGO_URI ||
				"mongodb+srv://muhammedsheheer99:ahSTaVwgEJba499x@cluster0.r5h8i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
		);
		console.log("Connected to MongoDB!");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1);
	}
};

export default connectDb;
