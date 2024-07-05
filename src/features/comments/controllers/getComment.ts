import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/commentInterface';
import { CommentCache } from '@service/redis/commentCache';
import { commentService } from '@service/db/commentService';
import mongoose from 'mongoose';

const commentCache: CommentCache = new CommentCache();

export class Get {
    public async comments(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;

        // Retrieve comments from the cache or the database
        const cachedComments: ICommentDocument[] = await commentCache.getCommentsFromCache(postId);
        const comments: ICommentDocument[] = cachedComments.length
            ? cachedComments
            : await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments });
    }

    public async commentsNamesFromCache(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;

        // Retrieve comment names from the cache or the database
        const cachedCommentsNames: ICommentNameList[] = await commentCache.getCommentsNamesFromCache(postId);
        const commentsNames: ICommentNameList[] = cachedCommentsNames.length
            ? cachedCommentsNames
            : await commentService.getPostCommentNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({ message: 'Post comments names', comments: commentsNames.length ? commentsNames[0] : [] });
    }

    public async singleComment(req: Request, res: Response): Promise<void> {
        const { postId, commentId } = req.params;

        // Retrieve single comment using id from the cache or the database
        const cachedComments: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);
        const comments: ICommentDocument[] = cachedComments.length
            ? cachedComments
            : await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({ message: 'Single comment', comments: comments.length ? comments[0] : [] });
    }
}
