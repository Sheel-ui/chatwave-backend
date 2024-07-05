import { IReactionJob } from '@reaction/interfaces/reactionInterface';
import { BaseQueue } from '@service/queues/baseQueue';
import { reactionWorker } from '@worker/reactionWorker';

class ReactionQueue extends BaseQueue {
    constructor() {
        super('reactions');
        // Add the jobs to add and remove reactions
        this.processJob('addReactionToDB', 5, reactionWorker.addReactionToDB);
        this.processJob('removeReactionFromDB', 5, reactionWorker.removeReactionFromDB);
    }

    public addReactionJob(name: string, data: IReactionJob): void {
        this.addJob(name, data);
    }
}

export const reactionQueue: ReactionQueue = new ReactionQueue();
