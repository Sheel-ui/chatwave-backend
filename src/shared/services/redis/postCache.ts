import { BaseCache } from '@service/redis/baseCache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/errorHandler';
import { ISavePostToCache, IPostDocument } from '@post/interfaces/postInterface';

// Create a logger instance for the PostCache class
const log: Logger = config.createLogger('postCache');

export class PostCache extends BaseCache {
    constructor() {
        super('postCache');
    }

    // Function to save post data to the cache
    public async savePostToCache(data: ISavePostToCache): Promise<void> {
        const { key, currentUserId, uId, createdPost } = data;

        // Destructure createdPost object
        const {
            _id,
            userId,
            username,
            email,
            avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount,
            imgVersion,
            imgId,
            videoId,
            videoVersion,
            reactions,
            createdAt
        } = createdPost;

        const dataToSave = {
            _id: `${_id}`,
            userId: `${userId}`,
            username: `${username}`,
            email: `${email}`,
            avatarColor: `${avatarColor}`,
            profilePicture: `${profilePicture}`,
            post: `${post}`,
            bgColor: `${bgColor}`,
            feelings: `${feelings}`,
            privacy: `${privacy}`,
            gifUrl: `${gifUrl}`,
            commentsCount: `${commentsCount}`,
            reactions: JSON.stringify(reactions),
            imgVersion: `${imgVersion}`,
            imgId: `${imgId}`,
            videoId: `${videoId}`,
            videoVersion: `${videoVersion}`,
            createdAt: `${createdAt}`
        };

        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Retrieve the current posts count for the user
            const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');

            // Create a multi transaction to perform multiple operations atomically
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();

            // Add the post to the sorted set with the score based on uId
            await this.client.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
            for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
                multi.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
            }

            // Increment the user's postsCount
            const count: number = parseInt(postCount[0], 10) + 1;
            multi.HSET(`users:${currentUserId}`, 'postsCount', count);

            // Execute the multi transaction
            multi.exec();
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}
