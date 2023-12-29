import express, { Express } from "express";
import { ChatWaveServer } from "./server";
import dbConnection from "./database";
import { config } from "./config";

class Application {
	public initialize(): void {
		this.loadConfig();
		dbConnection();
		const app: Express = express();
		const server: ChatWaveServer = new ChatWaveServer(app);
		server.start();
	}

	private loadConfig(): void {
		config.validate();
	}
}

const application: Application = new Application();
application.initialize();
