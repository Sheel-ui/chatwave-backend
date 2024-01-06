import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/authMock';
import * as followerServer from '@socket/follower';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followerMock';
import { existingUser } from '@root/mocks/userMock';
import { followerQueue } from '@service/queues/followerQueue';
import { Add } from '@follower/controllers/followUser';
import { UserCache } from '@service/redis/userCache';
import { FollowerCache } from '@service/redis/followerCache';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');
jest.mock('@service/redis/userCache');
jest.mock('@service/redis/followerCache');

Object.defineProperties(followerServer, {
    socketIOFollowerObject: {
        value: new Server(),
        writable: true
    }
});

describe('Add', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('Add', () => {
        beforeEach(() => {
            jest.restoreAllMocks();
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.clearAllTimers();
        });

        describe('follower', () => {
            it('should call updateFollowersCountInCache', async () => {
                const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
                const res: Response = followersMockResponse();
                jest.spyOn(FollowerCache.prototype, 'updateFollowersCountInCache');
                jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

                await Add.prototype.follower(req, res);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Following user now'
                });
            });

            it('should call saveFollowerToCache', async () => {
                const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
                const res: Response = followersMockResponse();
                jest.spyOn(followerServer.socketIOFollowerObject, 'emit');
                jest.spyOn(FollowerCache.prototype, 'saveFollowerToCache');
                jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

                await Add.prototype.follower(req, res);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Following user now'
                });
            });

            it('should call followerQueue addFollowerJob', async () => {
                const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
                const res: Response = followersMockResponse();
                const spy = jest.spyOn(followerQueue, 'addFollowerJob');

                await Add.prototype.follower(req, res);
                expect(followerQueue.addFollowerJob).toHaveBeenCalledWith('addFollowerToDB', {
                    keyOne: `${req.currentUser?.userId}`,
                    keyTwo: '6064861bc25eaa5a5d2f9bf4',
                    username: req.currentUser?.username,
                    followerDocumentId: spy.mock.calls[0][1].followerDocumentId
                });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Following user now'
                });
            });
        });
    });
});
