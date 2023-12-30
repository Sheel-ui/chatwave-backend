import express, { Express } from 'express';
import { ChatWaveServer } from '@root/server';
import dbConnection from '@root/database';
import { config } from '@root/config';

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
        config.cloudinaryConfig();
    }
}

const application: Application = new Application();
application.initialize();
