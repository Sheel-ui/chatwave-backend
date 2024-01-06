import { Job, DoneCallback } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { postService } from '@service/db/postService';

const log: Logger = config.createLogger('postWorker');

class PostWorker {
    // Method to save a post to the database based on the job data
    async savePostToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value } = job.data;

            // Call the addPostToDB method from the postService to save the post to the database
            await postService.addPostToDB(key, value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }

    async deletePostFromDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { keyOne, keyTwo } = job.data;
            // call the delete Post
            await postService.deletePost(keyOne, keyTwo);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
}

export const postWorker: PostWorker = new PostWorker();
