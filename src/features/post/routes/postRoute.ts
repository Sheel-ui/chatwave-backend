import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { Create } from '@post/controllers/createPost';
import { Get } from '@post/controllers/getPost';

class PostRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    // Post routes
    public routes(): Router {
        this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts);
        this.router.get('/post/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImages);

        this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
        this.router.post('/post/image/post', authMiddleware.checkAuthentication, Create.prototype.post);
        return this.router;
    }
}

export const postRoutes: PostRoutes = new PostRoutes();
