import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { Get } from '@comment/controllers/getComment';
import { Add } from '@comment/controllers/addComment';

class CommentRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        // POST
        this.router.get('/post/comments/:postId', authMiddleware.checkAuthentication, Get.prototype.comments);
        this.router.get('/post/commentsnames/:postId', authMiddleware.checkAuthentication, Get.prototype.commentsNamesFromCache);
        this.router.get('/post/single/comment/:postId/:commentId', authMiddleware.checkAuthentication, Get.prototype.singleComment);

        this.router.post('/post/comment', authMiddleware.checkAuthentication, Add.prototype.comment);

        return this.router;
    }
}

export const commentRoutes: CommentRoutes = new CommentRoutes();
