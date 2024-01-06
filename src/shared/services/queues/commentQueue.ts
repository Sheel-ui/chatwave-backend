import { ICommentJob } from '@comment/interfaces/commentInterface';
import { BaseQueue } from '@service/queues/baseQueue';
import { commentWorker } from '@worker/commentWorker';

class CommentQueue extends BaseQueue {
    constructor() {
        super('comments');
        this.processJob('addCommentToDB', 5, commentWorker.addCommentToDB);
    }

    public addCommentJob(name: string, data: ICommentJob): void {
        // Call the addJob method from the BaseQueue class to add a job to the queue
        this.addJob(name, data);
    }
}

export const commentQueue: CommentQueue = new CommentQueue();
