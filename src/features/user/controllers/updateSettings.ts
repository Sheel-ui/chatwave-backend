import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@service/redis/userCache';
import { userQueue } from '@service/queues/userQueue';
import { joiValidation } from '@global/decorators/joiValidationDecorators';
import { notificationSettingsSchema } from '@user/schemes/info';

const userCache: UserCache = new UserCache();

export class UpdateSettings {
    @joiValidation(notificationSettingsSchema)
    public async notification(req: Request, res: Response): Promise<void> {
        await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'notifications', req.body);
        userQueue.addUserJob('updateNotificationSettings', {
            key: `${req.currentUser!.userId}`,
            value: req.body
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Notification settings updated successfully', settings: req.body });
    }
}
