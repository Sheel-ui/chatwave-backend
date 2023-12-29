import express, { Express } from "express";
import { ChatWaveServer } from "./server";
import dbConnection from "./database";

class Application {
	public initialize(): void {
        dbConnection();
		const app: Express = express();
		const server: ChatWaveServer = new ChatWaveServer(app);
		server.start();
	}
}

const application: Application = new Application();
application.initialize();
