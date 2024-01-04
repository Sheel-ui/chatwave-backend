import { BaseQueue } from '@service/queues/baseQueue';
import { userWorker } from '@worker/userWorker';

class UserQueue extends BaseQueue {
    constructor() {
        super('user');
        // concurrency is 5
        this.processJob('addUserToDB', 5, userWorker.addUserToDB);
    }

    // Method for adding a user job to the queue
    public addUserJob(name: string, data: any): void {
        this.addJob(name, data);
    }
}

export const userQueue: UserQueue = new UserQueue();
