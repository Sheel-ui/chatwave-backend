import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { NotAuthorizedError } from '@global/helpers/errorHandler';
import { AuthPayload } from '@auth/interfaces/authInterface';

export class AuthMiddleware {
    public verifyUser(req: Request, _res: Response, next: NextFunction): void {
        // Check if a session with a JWT token exists in the request
        if (!req.session?.jwt) {
            throw new NotAuthorizedError('Session timeout. Login again.');
        }

        try {
            // Verify the JWT token and extract the payload
            const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload;
            req.currentUser = payload;
        } catch (error) {
            throw new NotAuthorizedError('Session invalid. Please login again.');
        }
        next();
    }

    public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
        // Check if the current user is set in the request object
        if (!req.currentUser) {
            throw new NotAuthorizedError('Authentication is required to access this route.');
        }
        next();
    }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
