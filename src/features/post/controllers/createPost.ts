import { joiValidation } from '@global/decorators/joiValidationDecorators';
import { postSchema } from '@post/schemes/post';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/postInterface';
import { PostCache } from '@service/redis/postCache';

const postCache: PostCache = new PostCache();

export class Create {
    // Use the joiValidation decorator to validate the request body against the postSchema
    @joiValidation(postSchema)
    public async post(req: Request, res: Response): Promise<void> {
        const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;
        const postObjectId: ObjectId = new ObjectId();
        const createdPost: IPostDocument = {
            _id: postObjectId,
            userId: req.currentUser!.userId,
            username: req.currentUser!.username,
            email: req.currentUser!.email,
            avatarColor: req.currentUser!.avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount: 0,
            imgVersion: '',
            imgId: '',
            videoId: '',
            videoVersion: '',
            createdAt: new Date(),
            reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
        } as IPostDocument;

        // Save the post to the Redis cache using the postCache instance
        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: `${req.currentUser!.userId}`,
            uId: `${req.currentUser!.uId}`,
            createdPost
        });

        res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
    }
}
