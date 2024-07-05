import { BaseCache } from '@service/redis/baseCache';
import Logger from 'bunyan';
import { find } from 'lodash';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/commentInterface';

// Logger instance
const log: Logger = config.createLogger('commentsCache');

export class CommentCache extends BaseCache {
    constructor() {
        super('commentsCache');
    }

    // Save a comment to the cache
    public async savePostCommentToCache(postId: string, value: string): Promise<void> {
        try {
            // Check if the Redis client connection is open; if not, connect
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Push the new comment to the list in the cache
            await this.client.LPUSH(`comments:${postId}`, value);

            // Update the comments count in the corresponding post hash in the cache
            const commentsCount: string[] = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
            let count: number = Helpers.parseJson(commentsCount[0]) as number;
            count += 1;
            await this.client.HSET(`posts:${postId}`, 'commentsCount', `${count}`);
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    // Retrieve all comments for a post from the cache
    public async getCommentsFromCache(postId: string): Promise<ICommentDocument[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Retrieve the comments list from the cache
            const reply: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
            const list: ICommentDocument[] = [];
            for (const item of reply) {
                list.push(Helpers.parseJson(item));
            }
            return list;
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getCommentsNamesFromCache(postId: string): Promise<ICommentNameList[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Get the count of comments for the specified post from the Redis cache.
            const commentsCount: number = await this.client.LLEN(`comments:${postId}`);
            const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);

            // Iterate through each comment, parse it, and extract the username.
            const list: string[] = [];
            for (const item of comments) {
                const comment: ICommentDocument = Helpers.parseJson(item) as ICommentDocument;
                list.push(comment.username);
            }

            // Response object containing the count and list of usernames.
            const response: ICommentNameList = {
                count: commentsCount,
                names: list
            };
            return [response];
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getSingleCommentFromCache(postId: string, commentId: string): Promise<ICommentDocument[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
            const list: ICommentDocument[] = [];
            for (const item of comments) {
                list.push(Helpers.parseJson(item));
            }

            // Iterate through comments and find the commentId
            const result: ICommentDocument = find(list, (listItem: ICommentDocument) => {
                return listItem._id === commentId;
            }) as ICommentDocument;

            return [result];
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}
