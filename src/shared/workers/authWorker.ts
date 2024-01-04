import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { authService } from '@service/db/authService';

const log: Logger = config.createLogger('authWorker');

class AuthWorker {
    // Method for adding an authentication user to the database
    async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value } = job.data;
            await authService.createAuthUser(value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
}

export const authWorker: AuthWorker = new AuthWorker();
