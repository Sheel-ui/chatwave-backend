import { IFollowerJobData } from '@follower/interfaces/followerInterface';
import { BaseQueue } from '@service/queues/baseQueue';
import { followerWorker } from '@worker/followerWorker';

class FollowerQueue extends BaseQueue {
    constructor() {
        super('followers');
        this.processJob('addFollowerToDB', 5, followerWorker.addFollowerToDB);
        this.processJob('removeFollowerFromDB', 5, followerWorker.removeFollowerFromDB);
    }

    public addFollowerJob(name: string, data: IFollowerJobData): void {
        this.addJob(name, data);
    }
}

export const followerQueue: FollowerQueue = new FollowerQueue();
