import { INotificationJobData } from '@notification/interfaces/notificationInterface';
import { BaseQueue } from '@service/queues/baseQueue';
import { notificationWorker } from '@worker/notificationWorker';

class NotificationQueue extends BaseQueue {
    constructor() {
        super('notifications');
        this.processJob('updateNotification', 5, notificationWorker.updateNotification);
        this.processJob('deleteNotification', 5, notificationWorker.deleteNotification);
    }

    public addNotificationJob(name: string, data: INotificationJobData): void {
        this.addJob(name, data);
    }
}

export const notificationQueue: NotificationQueue = new NotificationQueue();
