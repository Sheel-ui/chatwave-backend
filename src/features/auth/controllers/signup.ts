import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joiValidation.decorators';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinaryUpload';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@service/redis/userCache';
import { config } from '@root/config';
import { omit } from 'lodash';
import { authQueue } from '@service/queues/authQueue';

const userCache: UserCache = new UserCache();

export class SignUp {
    // Applying Joi validation to the 'create' method using the signupSchema
    @joiValidation(signupSchema)
    public async create(req: Request, res: Response): Promise<void> {
        // Destructuring data from the request body
        const { username, email, password, avatarColor, avatarImage } = req.body;
        const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
        if (checkIfUserExist) {
            throw new BadRequestError('Invalid credentials');
        }

        // Generating unique ObjectIds and a unique user Id
        const authObjectId: ObjectId = new ObjectId();
        const userObjectId: ObjectId = new ObjectId();
        const uId = `${Helpers.generateRandomIntegers(12)}`;

        // Creating authentication data based on the input
        const authData: IAuthDocument = SignUp.prototype.signUpData({
            _id: authObjectId,
            uId,
            username,
            email,
            password,
            avatarColor
        });

        // Uploading the avatar image to Cloudinary
        const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
        if (!result?.public_id) {
            throw new BadRequestError('File upload Error. Try again!');
        }

        // Add to redis cache
        const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
        userDataForCache.profilePicture = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
        await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

        // Add to database
        omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
        authQueue.addAuthUserJob('addAuthUserToDB', { value: userDataForCache });
        res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', authData });
    }

    private signUpData(data: ISignUpData): IAuthDocument {
        const { _id, username, email, uId, password, avatarColor } = data;
        return {
            _id,
            uId,
            username: Helpers.firstLetterUppercase(username),
            email: Helpers.lowerCase(email),
            password,
            avatarColor,
            createdAt: new Date()
        } as IAuthDocument;
    }

    private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
        const { _id, username, email, uId, password, avatarColor } = data;
        return {
            _id: userObjectId,
            authId: _id,
            uId,
            username: Helpers.firstLetterUppercase(username),
            email,
            password,
            avatarColor,
            profilePicture: '',
            blocked: [],
            blockedBy: [],
            work: '',
            location: '',
            school: '',
            quote: '',
            bgImageVersion: '',
            bgImageId: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            notifications: {
                messages: true,
                reactions: true,
                comments: true,
                follows: true
            },
            social: {
                facebook: '',
                instagram: '',
                twitter: '',
                youtube: ''
            }
        } as unknown as IUserDocument;
    }
}
