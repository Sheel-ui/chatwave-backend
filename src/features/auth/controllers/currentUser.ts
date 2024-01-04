import { Request, Response } from 'express';
import { UserCache } from '@service/redis/userCache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/userService';
import HTTP_STATUS from 'http-status-codes';

const userCache: UserCache = new UserCache();

export class CurrentUser {
    public async read(req: Request, res: Response): Promise<void> {
        let isUser = false;
        let token = null;
        let user = null;

        // Attempt to retrieve the user from the cache based on the user's ID
        const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument;
        // If the user is not in the cache, fetch it from the database
        const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(`${req.currentUser!.userId}`);
        if (Object.keys(existingUser).length) {
            isUser = true;
            token = req.session?.jwt;
            user = existingUser;
        }
        res.status(HTTP_STATUS.OK).json({ token, isUser, user });
    }
}
