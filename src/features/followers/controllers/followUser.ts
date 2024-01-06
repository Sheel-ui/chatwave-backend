import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@service/redis/followerCache';
import { UserCache } from '@service/redis/userCache';
import { IUserDocument } from '@user/interfaces/userInterface';
import { IFollowerData } from '@follower/interfaces/followerInterface';
import mongoose from 'mongoose';

const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

export class Add {
    public async follower(req: Request, res: Response): Promise<void> {
        const { followerId } = req.params;
        // Update follower and followee counts in the cache
        const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
        const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
        await Promise.all([followersCount, followeeCount]);

        // Retrieve cached user documents for the follower and followee
        const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(followerId) as Promise<IUserDocument>;
        const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser!.userId}`) as Promise<IUserDocument>;
        const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollower, cachedFollowee]);

        const followerObjectId: ObjectId = new ObjectId();
        const addFolloweeData: IFollowerData = Add.prototype.userData(response[0]);

        const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(
            `following:${req.currentUser!.userId}`,
            `${followerId}`
        );
        const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(
            `followers:${followerId}`,
            `${req.currentUser!.userId}`
        );
        await Promise.all([addFollowerToCache, addFolloweeToCache]);

        res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
    }

    // Method to transform user data for follower representation
    private userData(user: IUserDocument): IFollowerData {
        return {
            _id: new mongoose.Types.ObjectId(user._id),
            username: user.username!,
            avatarColor: user.avatarColor!,
            postCount: user.postsCount,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            profilePicture: user.profilePicture,
            uId: user.uId!,
            userProfile: user
        };
    }
}
