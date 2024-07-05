import { SignUp } from '@auth/controllers/signup';
import { SignIn } from '@auth/controllers/signin';
import { SignOut } from '@auth/controllers/signout';
import express, { Router } from 'express';
import { Password } from '@auth/controllers/password';

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    // Defining authentication routes
    public routes(): Router {
        this.router.post('/signup', SignUp.prototype.create);
        this.router.post('/signin', SignIn.prototype.read);
        this.router.post('/forgot-password', Password.prototype.create);
        this.router.post('/reset-password/:token', Password.prototype.update);
        return this.router;
    }

    public signoutRoute(): Router {
        this.router.get('/signout', SignOut.prototype.update);

        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
