import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joiValidationDecorators';
import { addCommentSchema } from '@comment/schemes/comment';
import { ICommentDocument, ICommentJob } from '@comment/interfaces/commentInterface';
import { CommentCache } from '@service/redis/commentCache';
import { commentQueue } from '@service/queues/commentQueue';

const commentCache: CommentCache = new CommentCache();

export class Add {
    @joiValidation(addCommentSchema)
    public async comment(req: Request, res: Response): Promise<void> {
        const { userTo, postId, profilePicture, comment } = req.body;
        const commentObjectId: ObjectId = new ObjectId();

        // Create a comment data object with required properties
        const commentData: ICommentDocument = {
            _id: commentObjectId,
            postId,
            username: `${req.currentUser?.username}`,
            avatarColor: `${req.currentUser?.avatarColor}`,
            profilePicture,
            comment,
            createdAt: new Date()
        } as ICommentDocument;

        // Save the comment to the cache
        await commentCache.savePostCommentToCache(postId, JSON.stringify(commentData));

        // Create a job data object for adding the comment to the database
        const databaseCommentData: ICommentJob = {
            postId,
            userTo,
            userFrom: req.currentUser!.userId,
            username: req.currentUser!.username,
            comment: commentData
        };

        // Add the comment job to the commentQueue for processing
        commentQueue.addCommentJob('addCommentToDB', databaseCommentData);
        res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' });
    }
}
