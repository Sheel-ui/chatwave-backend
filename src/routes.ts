import { authRoutes } from '@auth/routes/authRoutes';
import { currentUserRoutes } from '@auth/routes/currentRoutes';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { postRoutes } from '@post/routes/postRoute';
import { serverAdapter } from '@service/queues/baseQueue';
import { Application } from 'express';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
    const routes = () => {
        app.use('/queues', serverAdapter.getRouter());
        app.use(BASE_PATH, authRoutes.routes());
        app.use(BASE_PATH, authRoutes.signoutRoute());

        app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    };
    routes();
};
