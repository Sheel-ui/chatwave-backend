import { Request, Response } from 'express';
import { config } from '@root/config';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@global/decorators/joiValidationDecorators';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@service/db/authService';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/authInterface';
import { BadRequestError } from '@global/helpers/errorHandler';
import { IUserDocument } from '@user/interfaces/userInterface';
import { userService } from '@service/db/userService';

export class SignIn {
    // Applying the Joi validation decorator to the read method with the login schema
    @joiValidation(loginSchema)
    public async read(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        // Retrieving an existing user based on the provided username
        const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordsMatch: boolean = await existingUser.comparePassword(password);
        if (!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
        // Creating a JWT token with user-related information
        const userJwt: string = JWT.sign(
            {
                userId: user._id,
                uId: existingUser.uId,
                email: existingUser.email,
                username: existingUser.username,
                avatarColor: existingUser.avatarColor
            },
            config.JWT_TOKEN!
        );
        req.session = { jwt: userJwt };

        // Entire user document for response
        const userDocument: IUserDocument = {
            ...user,
            authId: existingUser!._id,
            username: existingUser!.username,
            email: existingUser!.email,
            avatarColor: existingUser!.avatarColor,
            uId: existingUser!.uId,
            createdAt: existingUser!.createdAt
        } as IUserDocument;
        res.status(HTTP_STATUS.OK).json({ message: 'User login successful', user: userDocument, token: userJwt });
    }
}
