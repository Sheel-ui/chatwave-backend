import { FollowerModel } from '@follower/models/followerSchema';
import { UserModel } from '@user/models/user.schema';
import { ObjectId, BulkWriteResult } from 'mongodb';
import mongoose, { Query } from 'mongoose';
import { IFollowerData, IFollowerDocument } from '@follower/interfaces/followerInterface';
import { IQueryDeleted, IQueryComplete } from '@post/interfaces/postInterface';
import { IUserDocument } from '@user/interfaces/userInterface';
import { UserCache } from '@service/redis/userCache';
import { map } from 'lodash';

const userCache: UserCache = new UserCache();

class FollowerService {
    public async addFollowerToDB(userId: string, followeeId: string, username: string, followerDocumentId: ObjectId): Promise<void> {
        const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
        const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId);

        // Create FollowerModel document for the new follower
        const following = await FollowerModel.create({
            _id: followerDocumentId,
            followeeId: followeeObjectId,
            followerId: followerObjectId
        });

        // Update user counts in UserModel for the follower and followee
        const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
            {
                updateOne: {
                    filter: { _id: userId },
                    update: { $inc: { followingCount: 1 } }
                }
            },
            {
                updateOne: {
                    filter: { _id: followeeId },
                    update: { $inc: { followersCount: 1 } }
                }
            }
        ]);

        const response: [BulkWriteResult, IUserDocument | null] = await Promise.all([users, userCache.getUserFromCache(followeeId)]);
    }

    public async removeFollowerFromDB(followeeId: string, followerId: string): Promise<void> {
        const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
        const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);

        // Delete FollowerModel document for the unfollow operation
        const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> = FollowerModel.deleteOne({
            followeeId: followeeObjectId,
            followerId: followerObjectId
        });

        // Update user counts in UserModel for the follower and followee
        const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
            {
                updateOne: {
                    filter: { _id: followerId },
                    update: { $inc: { followingCount: -1 } }
                }
            },
            {
                updateOne: {
                    filter: { _id: followeeId },
                    update: { $inc: { followersCount: -1 } }
                }
            }
        ]);

        await Promise.all([unfollow, users]);
    }

    public async getFolloweeData(userObjectId: ObjectId): Promise<IFollowerData[]> {
        // Aggregate query to retrieve and transform followee data
        const followee: IFollowerData[] = await FollowerModel.aggregate([
            { $match: { followerId: userObjectId } },
            { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
            { $unwind: '$followeeId' },
            { $lookup: { from: 'Auth', localField: 'followeeId.authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            {
                $addFields: {
                    _id: '$followeeId._id',
                    username: '$authId.username',
                    avatarColor: '$authId.avatarColor',
                    uId: '$authId.uId',
                    postCount: '$followeeId.postsCount',
                    followersCount: '$followeeId.followersCount',
                    followingCount: '$followeeId.followingCount',
                    profilePicture: '$followeeId.profilePicture',
                    userProfile: '$followeeId'
                }
            },
            {
                $project: {
                    authId: 0,
                    followerId: 0,
                    followeeId: 0,
                    createdAt: 0,
                    __v: 0
                }
            }
        ]);
        return followee;
    }

    public async getFollowerData(userObjectId: ObjectId): Promise<IFollowerData[]> {
        // Aggregate query to retrieve and transform follower data
        const follower: IFollowerData[] = await FollowerModel.aggregate([
            { $match: { followeeId: userObjectId } },
            { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
            { $unwind: '$followerId' },
            { $lookup: { from: 'Auth', localField: 'followerId.authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            {
                $addFields: {
                    _id: '$followerId._id',
                    username: '$authId.username',
                    avatarColor: '$authId.avatarColor',
                    uId: '$authId.uId',
                    postCount: '$followerId.postsCount',
                    followersCount: '$followerId.followersCount',
                    followingCount: '$followerId.followingCount',
                    profilePicture: '$followerId.profilePicture',
                    userProfile: '$followerId'
                }
            },
            // Project stage to exclude unnecessary fields
            {
                $project: {
                    authId: 0,
                    followerId: 0,
                    followeeId: 0,
                    createdAt: 0,
                    __v: 0
                }
            }
        ]);
        return follower;
    }

    public async getFolloweesIds(userId: string): Promise<string[]> {
        // Match documents where the user is a follower
        const followee = await FollowerModel.aggregate([
            { $match: { followerId: new mongoose.Types.ObjectId(userId) } },
            {
                $project: {
                    followeeId: 1,
                    _id: 0
                }
            }
        ]);
        return map(followee, (result) => result.followeeId.toString());
    }
}

export const followerService: FollowerService = new FollowerService();
