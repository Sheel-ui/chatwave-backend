import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { Add } from '@follower/controllers/followUser';
import { Get } from '@follower/controllers/getFollowers';
import { Remove } from '@follower/controllers/unfollowUser';

class FollowerRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {

        this.router.get('/user/following', authMiddleware.checkAuthentication, Get.prototype.userFollowing);
        this.router.get('/user/followers/:userId', authMiddleware.checkAuthentication, Get.prototype.userFollowers);

        // PUT
        this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, Add.prototype.follower);
        this.router.put('/user/unfollow/:followeeId/:followerId', authMiddleware.checkAuthentication, Remove.prototype.follower);

        return this.router;
    }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
