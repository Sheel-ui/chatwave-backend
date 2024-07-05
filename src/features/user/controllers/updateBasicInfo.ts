import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@service/redis/userCache';
import { userQueue } from '@service/queues/userQueue';
import { joiValidation } from '@global/decorators/joiValidationDecorators';
import { basicInfoSchema, socialLinksSchema } from '@user/schemes/info';

const userCache: UserCache = new UserCache();

export class Edit {
    @joiValidation(basicInfoSchema)
    public async info(req: Request, res: Response): Promise<void> {
        for (const [key, value] of Object.entries(req.body)) {
            await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, key, `${value}`);
        }
        userQueue.addUserJob('updateBasicInfoInDB', {
            key: `${req.currentUser!.userId}`,
            value: req.body
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
    }

    @joiValidation(socialLinksSchema)
    public async social(req: Request, res: Response): Promise<void> {
        await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'social', req.body);
        userQueue.addUserJob('updateSocialLinksInDB', {
            key: `${req.currentUser!.userId}`,
            value: req.body
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
    }
}
