import { Request, Response } from 'express';
import { PostCache } from '@service/redis/postCache';
import HTTP_STATUS from 'http-status-codes';
import { postQueue } from '@service/queues/postQueue';
import { socketIOPostObject } from '@socket/post';
import { joiValidation } from '@global/decorators/joiValidationDecorators';
import { postSchema } from '@post/schemes/post';
import { IPostDocument } from '@post/interfaces/postInterface';

const postCache: PostCache = new PostCache();

export class Update {
    @joiValidation(postSchema)
    public async posts(req: Request, res: Response): Promise<void> {
        const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body;
        const { postId } = req.params;
        const updatedPost: IPostDocument = {
            post,
            bgColor,
            privacy,
            feelings,
            gifUrl,
            profilePicture,
            imgId,
            imgVersion,
            videoId: '',
            videoVersion: ''
        } as IPostDocument;

        const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
        socketIOPostObject.emit('update post', postUpdated, 'posts');
        postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
        res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
    }
}
