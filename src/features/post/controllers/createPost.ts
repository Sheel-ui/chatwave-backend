import { joiValidation } from '@global/decorators/joiValidationDecorators';
import { postSchema, postWithImageSchema } from '@post/schemes/post';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/postInterface';
import { PostCache } from '@service/redis/postCache';
import { socketIOPostObject } from '@socket/post';
import { postQueue } from '@service/queues/postQueue';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '@global/helpers/errorHandler';
import { uploads } from '@global/helpers/cloudinaryUpload';
import { imageQueue } from '@service/queues/imageQueue';

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

        // Emit a 'add post' event using Socket.IO to inform clients about the new post
        socketIOPostObject.emit('add post', createdPost);
        // Save the post to the Redis cache using the postCache instance
        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: `${req.currentUser!.userId}`,
            uId: `${req.currentUser!.uId}`,
            createdPost
        });

        // Add post to DB
        postQueue.addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
        res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
    }

    @joiValidation(postWithImageSchema)
    public async postWithImage(req: Request, res: Response): Promise<void> {
        const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;

        const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
        if (!result?.public_id) {
            throw new BadRequestError(result.message);
        }

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
            imgVersion: result.version.toString(),
            imgId: result.public_id,
            videoId: '',
            videoVersion: '',
            createdAt: new Date(),
            reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
        } as IPostDocument;

        // Emit a 'add post' event using Socket.IO to inform clients about the new post
        socketIOPostObject.emit('add post', createdPost);

        // Save the post to the Redis cache using the postCache instance
        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: `${req.currentUser!.userId}`,
            uId: `${req.currentUser!.uId}`,
            createdPost
        });

        // Add a job to the postQueue to save the post to the database asynchronously
        postQueue.addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
        imageQueue.addImageJob('addImageToDB', {
            key: `${req.currentUser!.userId}`,
            imgId: result.public_id,
            imgVersion: result.version.toString()
          });
        res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with image successfully' });
    }
}
