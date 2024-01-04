import { IAuthJob } from '@auth/interfaces/authInterface';
import { BaseQueue } from '@service/queues/baseQueue';
import { authWorker } from '@worker/authWorker';

class AuthQueue extends BaseQueue {
    constructor() {
        super('auth');
        // concurrency is 5
        this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
    }

    // Method for adding an authentication user job to the queue
    public addAuthUserJob(name: string, data: IAuthJob): void {
        this.addJob(name, data);
    }
}

export const authQueue: AuthQueue = new AuthQueue();
