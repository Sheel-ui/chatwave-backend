import mongoose from "mongoose";
import { config } from "./config";

export default () => {
	const connect = () => {
		mongoose
			.connect(`${config.DATABASE_URL}`)
			.then(() => {
				console.log("Sucessfully connected to db.");
			})
			.catch((error) => {
				console.log("Error connecting to db", error);
				return process.exit(1);
			});
	};
	connect();

	mongoose.connection.on("disconnected", connect);
};
