import { Request, Response } from 'express';
import { PostCache } from '@service/redis/postCache';
import HTTP_STATUS from 'http-status-codes';
import { postQueue } from '@service/queues/postQueue';
import { socketIOPostObject } from '@socket/post';
import { joiValidation } from '@global/decorators/joiValidationDecorators';
import { postSchema, postWithImageSchema } from '@post/schemes/post';
import { IPostDocument } from '@post/interfaces/postInterface';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '@global/helpers/errorHandler';
import { uploads } from '@global/helpers/cloudinaryUpload';

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

    @joiValidation(postWithImageSchema)
    public async postWithImage(req: Request, res: Response): Promise<void> {
        const { imgId, imgVersion } = req.body;
        if (imgId && imgVersion) {
            Update.prototype.updatePost(req);
        } else {
            const result: UploadApiResponse = await Update.prototype.addImageToExistingPost(req);
            if (!result.public_id) {
                throw new BadRequestError(result.message);
            }
        }
        res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
    }

    private async updatePost(req: Request): Promise<void> {
        const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture, videoId, videoVersion } = req.body;
        const { postId } = req.params;
        const updatedPost: IPostDocument = {
            post,
            bgColor,
            privacy,
            feelings,
            gifUrl,
            profilePicture,
            imgId: imgId ? imgId : '',
            imgVersion: imgVersion ? imgVersion : '',
            videoId: videoId ? videoId : '',
            videoVersion: videoVersion ? videoVersion : ''
        } as IPostDocument;

        const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
        socketIOPostObject.emit('update post', postUpdated, 'posts');
        postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
    }

    private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
        const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image, video } = req.body;
        const { postId } = req.params;
        const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
        if (!result?.public_id) {
            return result;
        }
        const updatedPost: IPostDocument = {
            post,
            bgColor,
            privacy,
            feelings,
            gifUrl,
            profilePicture,
            imgId: image ? result.public_id : '',
            imgVersion: image ? result.version.toString() : '',
            videoId: video ? result.public_id : '',
            videoVersion: video ? result.version.toString() : ''
        } as IPostDocument;

        const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
        socketIOPostObject.emit('update post', postUpdated, 'posts');
        postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
        return result;
    }
}
