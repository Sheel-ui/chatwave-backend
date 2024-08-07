import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@service/redis/userCache';
import { IUserDocument } from '@user/interfaces/userInterface';
import { socketIOImageObject } from '@socket/image';
import { imageQueue } from '@service/queues/imageQueue';
import { IFileImageDocument } from '@image/interfaces/imageInterface';
import { imageService } from '@service/db/imageService';

const userCache: UserCache = new UserCache();

export class Delete {
    public async image(req: Request, res: Response): Promise<void> {
        const { imageId } = req.params;
        socketIOImageObject.emit('delete image', imageId);
        imageQueue.addImageJob('removeImageFromDB', {
            imageId
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
    }

    public async backgroundImage(req: Request, res: Response): Promise<void> {
        const image: IFileImageDocument = await imageService.getImageByBackgroundId(req.params.bgImageId);

        if (!image) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Image not found' });
        }

        if (typeof image._id === 'string') {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid image ID type' });
            socketIOImageObject.emit('delete image', image?._id);
            const bgImageId: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
                `${req.currentUser!.userId}`,
                'bgImageId',
                ''
            ) as Promise<IUserDocument>;
            const bgImageVersion: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
                `${req.currentUser!.userId}`,
                'bgImageVersion',
                ''
            ) as Promise<IUserDocument>;
            (await Promise.all([bgImageId, bgImageVersion])) as [IUserDocument, IUserDocument];
            imageQueue.addImageJob('removeImageFromDB', {
                imageId: image?._id
            });
            res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
        } else {
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Image not found' });
        }
    }
}
