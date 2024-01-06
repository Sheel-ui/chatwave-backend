import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { Add } from '@reaction/controllers/addReaction';
import { Remove } from '@reaction/controllers/removeReaction';
import { Get } from '@reaction/controllers/getReaction';

class ReactionRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        // GET
        this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, Get.prototype.reactions);
        this.router.get(
            '/post/single/reaction/username/:username/:postId',
            authMiddleware.checkAuthentication,
            Get.prototype.singleReactionByUsername
        );
        this.router.get('/post/reactions/username/:username', authMiddleware.checkAuthentication, Get.prototype.reactionsByUsername);

        // POST
        this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);

        // DELETE
        this.router.delete(
            '/post/reaction/:postId/:previousReaction/:postReactions',
            authMiddleware.checkAuthentication,
            Remove.prototype.reaction
        );

        return this.router;
    }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
