import { BaseCache } from '@service/redis/baseCache';
import Logger from 'bunyan';
import { find } from 'lodash';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/errorHandler';
import { IReactionDocument, IReactions } from '@reaction/interfaces/reactionInterface';
import { Helpers } from '@global/helpers/helpers';

const log: Logger = config.createLogger('reactionsCache');

export class ReactionCache extends BaseCache {
    constructor() {
        super('reactionsCache');
    }

    public async savePostReactionToCache(
        key: string,
        reaction: IReactionDocument,
        postReactions: IReactions,
        type: string,
        previousReaction: string
    ): Promise<void> {
        try {
            // No open connection
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Remove if reaction exist
            if (previousReaction) {
                this.removePostReactionFromCache(key, reaction.username, postReactions);
            }

            // Save the new reaction to the cache
            if (type) {
                await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
                await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
            }
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    // Method to remove a post reaction from the cache
    public async removePostReactionFromCache(key: string, username: string, postReactions: IReactions): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            // Get the list of reactions from the cache
            const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            // Find the previous reaction of the user in the list
            const userPreviousReaction: IReactionDocument = this.getPreviousReaction(response, username) as IReactionDocument;

            // Remove the user's previous reaction from the list
            multi.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
            await multi.exec();

            // Update the post reactions in the cache
            await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getReactionsFromCache(postId: string): Promise<[IReactionDocument[], number]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Total count
            const reactionsCount: number = await this.client.LLEN(`reactions:${postId}`);

            // Get the list of reactions from the cache
            const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);

            // Parse the JSON strings to obtain a list of reaction objects
            const list: IReactionDocument[] = [];
            for (const item of response) {
                list.push(Helpers.parseJson(item));
            }
            return response.length ? [list, reactionsCount] : [[], 0];
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    // Method to get a single reaction for a post based on the username from the cache
    public async getSingleReactionByUsernameFromCache(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            // Get the list of reactions from the cache
            const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);

            const list: IReactionDocument[] = [];
            for (const item of response) {
                list.push(Helpers.parseJson(item));
            }

            // Find the reaction object for the specified username
            const result: IReactionDocument = find(list, (listItem: IReactionDocument) => {
                return listItem?.postId === postId && listItem?.username === username;
            }) as IReactionDocument;

            return result ? [result, 1] : [];
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    // Helper method to find the previous reaction of a user in the list
    private getPreviousReaction(response: string[], username: string): IReactionDocument | undefined {
        const list: IReactionDocument[] = [];

        // Parse the JSON strings to obtain a list of reaction objects
        for (const item of response) {
            list.push(Helpers.parseJson(item) as IReactionDocument);
        }

        // Find the reaction object for the specified username
        return find(list, (listItem: IReactionDocument) => {
            return listItem.username === username;
        });
    }
}
