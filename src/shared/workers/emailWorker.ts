import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { mailTransport } from '@service/emails/mailTransport';

const log: Logger = config.createLogger('emailWorker');

class EmailWorker {
    async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
        try {
            // Data from the job payload
            const { template, receiverEmail, subject } = job.data;
            // Notification email using the mail transport service
            await mailTransport.sendEmail(receiverEmail, subject, template);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            log.error(error);
            done(error as Error);
        }
    }
}

export const emailWorker: EmailWorker = new EmailWorker();
