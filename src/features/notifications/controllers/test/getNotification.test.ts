import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/authMock';
import { notificationData, notificationMockRequest, notificationMockResponse } from '@root/mocks/notificationMock';
import { Get } from '@notification/controllers/getNotification';
import { notificationService } from '@service/db/notificationService';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');
jest.mock('@service/db/notificationService');

describe('Get', () => {
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
        jest.spyOn(notificationService, 'getNotifications').mockResolvedValue([notificationData]);

        await Get.prototype.notifications(req, res);
        expect(notificationService.getNotifications).toHaveBeenCalledWith(req.currentUser!.userId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User notifications',
            notifications: [notificationData]
        });
    });
});
