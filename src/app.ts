import express, { Express } from 'express';
import { ChatWaveServer } from '@root/server';
import dbConnection from '@root/database';
import { config } from '@root/config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('app');

class Application {
    public initialize(): void {
        this.loadConfig();
        dbConnection();
        const app: Express = express();
        const server: ChatWaveServer = new ChatWaveServer(app);
        server.start();
        Application.handleExit();
    }

    private loadConfig(): void {
        config.validate();
        config.cloudinaryConfig();
    }

    private static handleExit(): void {
        process.on('uncaughtException', (error: Error) => {
            log.error(`There was an uncaught error: ${error}`);
            Application.shutDownProperly(1);
        });

        process.on('unhandleRejection', (reason: Error) => {
            log.error(`Unhandled Rejection at promise: ${reason}`);
            Application.shutDownProperly(2);
        });

        process.on('SIGTERM', () => {
            log.error('Caught SIGTERM');
            Application.shutDownProperly(2);
        });

        process.on('SIGINT', () => {
            log.error('Caught SIGINT');
            Application.shutDownProperly(2);
        });

        process.on('exit', () => {
            log.error('Exiting');
        });
    }

    private static shutDownProperly(exitCode: number): void {
        Promise.resolve()
            .then(() => {
                log.info('Shutdown complete');
                process.exit(exitCode);
            })
            .catch((error) => {
                log.error(`Error during shutdown: ${error}`);
                process.exit(1);
            });
    }
}

const application: Application = new Application();
application.initialize();
