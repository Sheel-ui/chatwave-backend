import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { Add } from '@reaction/controllers/addReaction';

class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {

    // POST
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);

    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
