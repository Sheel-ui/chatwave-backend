import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { ExpressAdapter } from '@bull-board/express';
import { config } from '@root/config';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import { IAuthJob } from '@auth/interfaces/authInterface';
import { IEmailJob } from '@user/interfaces/userInterface';
import { IPostJobData } from '@post/interfaces/postInterface';
import { IReactionJob } from '@reaction/interfaces/reactionInterface';
import { ICommentJob } from '@comment/interfaces/commentInterface';
import { INotificationJobData } from '@notification/interfaces/notificationInterface';
import { IFileImageJobData } from '@image/interfaces/imageInterface';
import { IChatJobData, IMessageData } from '@chat/interfaces/chatInterface';

type IBaseJobData = IAuthJob | IEmailJob | IPostJobData | IReactionJob | ICommentJob | INotificationJobData | IFileImageJobData | IChatJobData | IMessageData;

let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
    queue: Queue.Queue;
    log: Logger;

    constructor(queueName: string) {
        this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
        bullAdapters.push(new BullAdapter(this.queue));

        // Removing duplicate adapters from the array
        bullAdapters = [...new Set(bullAdapters)];
        serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/queues');

        createBullBoard({
            queues: bullAdapters,
            serverAdapter
        });

        // Creating a Logger instance for the queue
        this.log = config.createLogger(`${queueName}Queue`);

        // Event handler for when a job is completed
        this.queue.on('completed', (job: Job) => {
            job.remove();
        });

        // Event handler for global completed event
        this.queue.on('global:completed', (jobId: string) => {
            this.log.info(`Job ${jobId} completed`);
        });

        // Event handler for global stalled event
        this.queue.on('global:stalled', (jobId: string) => {
            this.log.info(`Job ${jobId} is stalled`);
        });
    }

    // Method to add a job to the queue
    protected addJob(name: string, data: IBaseJobData): void {
        this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
    }

    // Method to process jobs with a given name, concurrency, and callback function
    protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
        this.queue.process(name, concurrency, callback);
    }
}
