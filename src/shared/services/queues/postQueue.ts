import { IPostJobData } from '@post/interfaces/postInterface';
import { BaseQueue } from '@service/queues/baseQueue';
import { postWorker } from '@worker/postWorker';

class PostQueue extends BaseQueue {
    constructor() {
        super('posts');
        this.processJob('addPostToDB', 5, postWorker.savePostToDB);
    }

    public addPostJob(name: string, data: IPostJobData): void {
        this.addJob(name, data);
    }
}

export const postQueue: PostQueue = new PostQueue();
