import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from '@service/queues/baseQueue';

class AuthQueue extends BaseQueue {
    constructor() {
        super('auth');
    }

    // Method for adding an authentication user job to the queue
    public addAuthUserJob(name: string, data: IAuthJob): void {
        this.addJob(name, data);
    }
}

export const authQueue: AuthQueue = new AuthQueue();
