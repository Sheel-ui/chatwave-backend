import { CurrentUser } from '@auth/controllers/currentUser';
import { authMiddleware } from '@global/helpers/authMiddleware';
import express, { Router } from 'express';

class CurrentUserRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    // get current user
    public routes(): Router {
        this.router.get('/currentuser', authMiddleware.checkAuthentication, CurrentUser.prototype.read);

        return this.router;
    }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes();
