import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { userService } from '@service/db/userService';

const log: Logger = config.createLogger('authWorker');

class UserWorker {
    // Method for adding a user to the database
    async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { value } = job.data;
            await userService.addUserData(value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }

    async updateUserInfo(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value } = job.data;
            await userService.updateUserInfo(key, value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }

    async updateSocialLinks(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value } = job.data;
            await userService.updateSocialLinks(key, value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }

    async updateNotificationSettings(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value } = job.data;
            await userService.updateNotificationSettings(key, value);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
}

export const userWorker: UserWorker = new UserWorker();
