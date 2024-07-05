import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IReactionJob } from '@reaction/interfaces/reactionInterface';
import { ReactionCache } from '@service/redis/reactionCache';
import { reactionQueue } from '@service/queues/reactionQueue';

const reactionCache: ReactionCache = new ReactionCache();

export class Remove {
    public async reaction(req: Request, res: Response): Promise<void> {
        const { postId, previousReaction, postReactions } = req.params;

        // Remove the reaction from the Redis cache
        await reactionCache.removePostReactionFromCache(postId, `${req.currentUser!.username}`, JSON.parse(postReactions));

        // Prepare data for the reaction removal job
        const databaseReactionData: IReactionJob = {
            postId,
            username: req.currentUser!.username,
            previousReaction
        };

        // Add a reaction removal job to the queue
        reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData);
        res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post' });
    }
}
