import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/authMock';
import { UpdateSettings } from '@user/controllers/updateSettings';
import { userQueue } from '@service/queues/userQueue';
import { UserCache } from '@service/redis/userCache';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');
jest.mock('@service/redis/userCache');

describe('Settings', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('update', () => {
        it('should call "addUserJob" methods', async () => {
            const settings = {
                messages: true,
                reactions: false,
                comments: true,
                follows: false
            };
            const req: Request = authMockRequest({}, settings, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache');
            jest.spyOn(userQueue, 'addUserJob');

            await UpdateSettings.prototype.notification(req, res);
            expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(
                `${req.currentUser?.userId}`,
                'notifications',
                req.body
            );
            expect(userQueue.addUserJob).toHaveBeenCalledWith('updateNotificationSettings', {
                key: `${req.currentUser?.userId}`,
                value: req.body
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Notification settings updated successfully', settings: req.body });
        });
    });
});
