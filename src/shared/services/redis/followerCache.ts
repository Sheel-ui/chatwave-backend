import { BaseCache } from '@service/redis/baseCache';
import Logger from 'bunyan';
import { remove } from 'lodash';
import mongoose from 'mongoose';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/errorHandler';
import { IFollowerData } from '@follower/interfaces/followerInterface';
import { UserCache } from '@service/redis/userCache';
import { IUserDocument } from '@user/interfaces/userInterface';
import { Helpers } from '@global/helpers/helpers';

const log: Logger = config.createLogger('followersCache');
const userCache: UserCache = new UserCache();

export class FollowerCache extends BaseCache {
    constructor() {
        super('followersCache');
    }

    // Save a follower to the cache list
    public async saveFollowerToCache(key: string, value: string): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Add the follower to the cache list
            await this.client.LPUSH(key, value);
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async removeFollowerFromCache(key: string, value: string): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Remove the follower from the cache list
            await this.client.LREM(key, 1, value);
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async updateFollowersCountInCache(userId: string, prop: string, value: number): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Increment the specified property in the user's cache hash
            await this.client.HINCRBY(`users:${userId}`, prop, value);
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getFollowersFromCache(key: string): Promise<IFollowerData[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            // Get follower IDs from the cache list
            const response: string[] = await this.client.LRANGE(key, 0, -1);
            const list: IFollowerData[] = [];
            for (const item of response) {
                // Retrieve user data from userCache
                const user: IUserDocument = (await userCache.getUserFromCache(item)) as IUserDocument;

                // Transform user data for follower list

                const data: IFollowerData = {
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
                list.push(data);
            }
            return list;
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async updateBlockedUserPropInCache(key: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Retrieve current blocked user IDs from the cache
            const response: string = (await this.client.HGET(`users:${key}`, prop)) as string;
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();

            // Parse and update the blocked user IDs based on the operation type
            let blocked: string[] = Helpers.parseJson(response) as string[];
            if (type === 'block') {
                blocked = [...blocked, value];
            } else {
                remove(blocked, (id: string) => id === value);
                blocked = [...blocked];
            }

            // Update the blocked user IDs in the user's cache hash
            multi.HSET(`users:${key}`, `${prop}`, JSON.stringify(blocked));
            await multi.exec();
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}
