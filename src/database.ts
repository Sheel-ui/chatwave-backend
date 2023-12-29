import mongoose from "mongoose";

export default () => {
	const connect = () => {
		mongoose
			.connect("mongodb://127.0.0.1:27017/chatwave-backend")
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
