import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { commentService } from '@service/db/commentService';

const log: Logger = config.createLogger('commentWorker');

class CommentWorker {
    async addCommentToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { data } = job;
            // Call the addCommentToDB method in the commentService to add the comment to the database
            await commentService.addCommentToDB(data);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
}

export const commentWorker: CommentWorker = new CommentWorker();
