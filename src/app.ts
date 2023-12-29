import express, {Express} from "express";
import { ChatWaveServer } from "./server";

class Application {
    public initialize(): void {
        const app: Express = express();
        const server: ChatWaveServer = new ChatWaveServer(app);
        server.start();
    }
}

const application: Application = new Application();
application.initialize();