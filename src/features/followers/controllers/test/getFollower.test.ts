import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authUserPayload } from '@root/mocks/authMock';
import { followersMockRequest, followersMockResponse, mockFollowerData } from '@root/mocks/followerMock';
import { FollowerCache } from '@service/redis/followerCache';
import { Get } from '@follower/controllers/getFollowers';
import { followerService } from '@service/db/followerService';
import { existingUserTwo } from '@root/mocks/userMock';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');
jest.mock('@service/redis/followerCache');

describe('Get', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('userFollowing', () => {
        it('should send correct json response if user following exist in cache', async () => {
            const req: Request = followersMockRequest({}, authUserPayload) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([mockFollowerData]);

            await Get.prototype.userFollowing(req, res);
            expect(FollowerCache.prototype.getFollowersFromCache).toBeCalledWith(`following:${req.currentUser?.userId}`);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User following',
                following: [mockFollowerData]
            });
        });

        it('should send correct json response if user following exist in database', async () => {
            const req: Request = followersMockRequest({}, authUserPayload) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
            jest.spyOn(followerService, 'getFolloweeData').mockResolvedValue([mockFollowerData]);

            await Get.prototype.userFollowing(req, res);
            expect(followerService.getFolloweeData).toHaveBeenCalledWith(new mongoose.Types.ObjectId(req.currentUser!.userId));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User following',
                following: [mockFollowerData]
            });
        });

        it('should return empty following if user following does not exist', async () => {
            const req: Request = followersMockRequest({}, authUserPayload) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
            jest.spyOn(followerService, 'getFolloweeData').mockResolvedValue([]);

            await Get.prototype.userFollowing(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User following',
                following: []
            });
        });
    });

    describe('userFollowers', () => {
        it('should send correct json response if user follower exist in cache', async () => {
            const req: Request = followersMockRequest({}, authUserPayload, { userId: `${existingUserTwo._id}` }) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([mockFollowerData]);

            await Get.prototype.userFollowers(req, res);
            expect(FollowerCache.prototype.getFollowersFromCache).toBeCalledWith(`followers:${req.params.userId}`);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followers',
                followers: [mockFollowerData]
            });
        });

        it('should send correct json response if user following exist in database', async () => {
            const req: Request = followersMockRequest({}, authUserPayload, { userId: `${existingUserTwo._id}` }) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
            jest.spyOn(followerService, 'getFollowerData').mockResolvedValue([mockFollowerData]);

            await Get.prototype.userFollowers(req, res);
            expect(followerService.getFollowerData).toHaveBeenCalledWith(new mongoose.Types.ObjectId(req.params.userId));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followers',
                followers: [mockFollowerData]
            });
        });

        it('should return empty following if user following does not exist', async () => {
            const req: Request = followersMockRequest({}, authUserPayload, { userId: `${existingUserTwo._id}` }) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
            jest.spyOn(followerService, 'getFollowerData').mockResolvedValue([]);

            await Get.prototype.userFollowers(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followers',
                followers: []
            });
        });
    });
});
