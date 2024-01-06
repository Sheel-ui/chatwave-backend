import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { Add } from '@reaction/controllers/addReaction';
import { Remove } from '@reaction/controllers/removeReaction';

class ReactionRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
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
