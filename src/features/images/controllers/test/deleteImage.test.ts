import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/authMock';
import * as imageServer from '@socket/image';
import { fileDocumentMock, imagesMockRequest, imagesMockResponse } from '@root/mocks/imageMock';
import { imageQueue } from '@service/queues/imageQueue';
import { Delete } from '@image/controllers/deleteImage';
import { imageService } from '@service/db/imageService';
import { UserCache } from '@service/redis/userCache';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');
jest.mock('@service/redis/userCache');

Object.defineProperties(imageServer, {
    socketIOImageObject: {
        value: new Server(),
        writable: true
    }
});

describe('Delete', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should send correct json response for image upload', async () => {
        const req: Request = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' }) as Request;
        const res: Response = imagesMockResponse();
        jest.spyOn(imageServer.socketIOImageObject, 'emit');
        jest.spyOn(imageQueue, 'addImageJob');

        await Delete.prototype.image(req, res);
        expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('delete image', req.params.imageId);
        expect(imageQueue.addImageJob).toHaveBeenCalledWith('removeImageFromDB', { imageId: req.params.imageId });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Image deleted successfully'
        });
    });

    // it('should send correct json response for background image upload', async () => {
    //     const req: Request = imagesMockRequest({}, {}, authUserPayload, { bgImageId: '12345' }) as Request;
    //     const res: Response = imagesMockResponse();
    //     jest.spyOn(imageServer.socketIOImageObject, 'emit');
    //     jest.spyOn(imageQueue, 'addImageJob');
    //     jest.spyOn(imageService, 'getImageByBackgroundId').mockResolvedValue(fileDocumentMock);
    //     jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache');

    //     await Delete.prototype.backgroundImage(req, res);
    //     expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('delete image', req.params.imageId);
    //     expect(imageQueue.addImageJob).toHaveBeenCalledWith('removeImageFromDB', { imageId: req.params.imageId });
    //     expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'bgImageVersion', '');
    //     expect(res.status).toHaveBeenCalledWith(200);
    //     expect(res.json).toHaveBeenCalledWith({
    //         message: 'Image deleted successfully'
    //     });
    // });
});
