import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { Create } from '@post/controllers/createPost';

class PostRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    // Post routes
    public routes(): Router {
        this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
        return this.router;
    }
}

export const postRoutes: PostRoutes = new PostRoutes();
