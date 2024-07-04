import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/authMock';
import * as notificationServer from '@socket/notification';
import { notificationMockRequest, notificationMockResponse } from '@root/mocks/notificationMock';
import { notificationQueue } from '@service/queues/notificationQueue';
import { Delete } from '@notification/controllers/deleteNotification';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');

Object.defineProperties(notificationServer, {
    socketIONotificationObject: {
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

    it('should send correct json response', async () => {
        const req: Request = notificationMockRequest({}, authUserPayload, { notificationId: '12345' }) as Request;
        const res: Response = notificationMockResponse();
        jest.spyOn(notificationServer.socketIONotificationObject, 'emit');
        jest.spyOn(notificationQueue, 'addNotificationJob');

        await Delete.prototype.notification(req, res);
        expect(notificationServer.socketIONotificationObject.emit).toHaveBeenCalledWith('delete notification', req.params.notificationId);
        expect(notificationQueue.addNotificationJob).toHaveBeenCalledWith('deleteNotification', { key: req.params.notificationId });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Notification deleted successfully'
        });
    });
});
