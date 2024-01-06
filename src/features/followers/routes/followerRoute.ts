import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { Add } from '@follower/controllers/followUser';

class FollowerRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        // PUT
        this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, Add.prototype.follower);

        return this.router;
    }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
