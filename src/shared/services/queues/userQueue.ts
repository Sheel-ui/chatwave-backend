import { BaseQueue } from '@service/queues/baseQueue';
import { IUserJob } from '@user/interfaces/userInterface';
import { userWorker } from '@worker/userWorker';

class UserQueue extends BaseQueue {
    constructor() {
        super('user');
        // concurrency is 5
        this.processJob('addUserToDB', 5, userWorker.addUserToDB);
        this.processJob('updateSocialLinksInDB', 5, userWorker.updateSocialLinks);
        this.processJob('updateBasicInfoInDB', 5, userWorker.updateUserInfo);
        this.processJob('updateNotificationSettings', 5, userWorker.updateNotificationSettings);
    }

    // Method for adding a user job to the queue
    public addUserJob(name: string, data: IUserJob): void {
        this.addJob(name, data);
    }
}

export const userQueue: UserQueue = new UserQueue();
