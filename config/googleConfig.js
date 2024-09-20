import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const redirectUri =
	process.env.NODE_ENV === "production"
		? "https://active-front-end-mohammed-sheheer-cbs-projects.vercel.app"
		: "http://localhost:3000";

export const client = new OAuth2Client(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	redirectUri
);
