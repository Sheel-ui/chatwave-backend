import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import { config } from '@root/config';
import routes from '@root/routes';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import apiStats from 'swagger-stats';
import compression from 'compression';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import 'express-async-errors';
import Logger from 'bunyan';
import { CustomError, IErrorResponse } from '@global/helpers/errorHandler';
import { SocketIOPostHandler } from '@socket/post';
import { SocketIOFollowerHandler } from '@socket/follower';
import { SocketIOUserHandler } from '@socket/user';
import { SocketIONotificationHandler } from '@socket/notification';
import { SocketIOImageHandler } from '@socket/image';
import { SocketIOChatHandler } from '@socket/chat';

const SERVER_PORT = 3000;
const log: Logger = config.createLogger('server');

export class ChatWaveServer {
    private app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public start(): void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routeMiddleware(this.app);
        this.apiMonitoring(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddleware(app: Application): void {
        app.use(
            cookieSession({
                name: 'session',
                keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
                maxAge: 24 * 7 * 3000000,
                secure: config.NODE_ENV !== 'dev'
            })
        );
        app.use(hpp());
        app.use(helmet());
        app.use(
            cors({
                origin: '*',
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            })
        );
    }

    private standardMiddleware(app: Application): void {
        app.use(compression());
        app.use(json({ limit: '50mb' }));
        app.use(urlencoded({ extended: true, limit: '50mb' }));
    }

    private routeMiddleware(app: Application): void {
        routes(app);
    }

    private apiMonitoring(app: Application): void {
        app.use(
            apiStats.getMiddleware({
                uriPath: '/api-monitoring'
            })
        );
    }

    private globalErrorHandler(app: Application): void {
        app.all('*', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                message: `${req.originalUrl} not found`
            });
        });

        app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
            log.error(error);
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json(error.serializeErrors());
            }
            next();
        });
    }

    private async startServer(app: Application): Promise<void> {
        if (!config.JWT_TOKEN) {
            throw new Error('JWT token must be provided.');
        }
        try {
            const httpServer: http.Server = new http.Server(app);
            const socketIO: Server = await this.createSocketIO(httpServer);
            this.startHttpServer(httpServer);
            this.socketIOConn(socketIO);
        } catch (error) {
            log.error(error);
        }
    }

    private async createSocketIO(httpServer: http.Server): Promise<Server> {
        const io: Server = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            }
        });

        const pubClient = createClient({ url: config.REDIS_HOST });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        return io;
    }

    private startHttpServer(httpServer: http.Server): void {
        log.info(`Worker started with pid ${process.pid}`);
        log.info(`Server started with pid ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Server runnig on port ${SERVER_PORT}`);
        });
    }

    private socketIOConn(io: Server): void {
        const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
        const followerSocketHandler: SocketIOFollowerHandler = new SocketIOFollowerHandler(io);
        const userSocketHandler: SocketIOUserHandler = new SocketIOUserHandler(io);
        const notificationSocketHandler: SocketIONotificationHandler = new SocketIONotificationHandler();
        const imageSocketHandler: SocketIOImageHandler = new SocketIOImageHandler();
        const chatSocketHandler: SocketIOChatHandler = new SocketIOChatHandler(io);

        postSocketHandler.listen();
        followerSocketHandler.listen();
        userSocketHandler.listen();
        notificationSocketHandler.listen(io);
        imageSocketHandler.listen(io);
        chatSocketHandler.listen();
    }
}
