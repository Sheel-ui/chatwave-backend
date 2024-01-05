import { BaseQueue } from '@service/queues/baseQueue';
import { IEmailJob } from '@user/interfaces/user.interface';
import { emailWorker } from '@worker/emailWorker';

class EmailQueue extends BaseQueue {
    constructor() {
        // Initializing the queue with the name 'emails' and processing a specific job
        super('emails');
        this.processJob('forgotPasswordEmail', 5, emailWorker.addNotificationEmail);
    }

    public addEmailJob(name: string, data: IEmailJob): void {
        this.addJob(name, data);
    }
}

export const emailQueue: EmailQueue = new EmailQueue();
