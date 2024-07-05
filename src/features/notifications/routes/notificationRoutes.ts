import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { Update } from '@notification/controllers/updateNotification';
import { Delete } from '@notification/controllers/deleteNotification';
import { Get } from '@notification/controllers/getNotification';

class NotificationRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/notifications', authMiddleware.checkAuthentication, Get.prototype.notifications);
        this.router.put('/notification/:notificationId', authMiddleware.checkAuthentication, Update.prototype.notification);
        this.router.delete('/notification/:notificationId', authMiddleware.checkAuthentication, Delete.prototype.notification);

        return this.router;
    }
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();
