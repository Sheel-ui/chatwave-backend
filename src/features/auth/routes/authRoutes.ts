import { SignUp } from '@auth/controllers/signup';
import { SignIn } from '@auth/controllers/signin';
import express, { Router } from 'express';
class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    // Defining authentication routes
    public routes(): Router {
        this.router.post('/signup', SignUp.prototype.create);
        this.router.post('/signin', SignIn.prototype.read);
        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
