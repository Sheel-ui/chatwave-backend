import { Request, Response } from 'express';
import { CurrentUser } from '@auth/controllers/currentUser';
import { authMockRequest, authMockResponse, authUserPayload } from '@root/mocks/authMock';
import { UserCache } from '@service/redis/userCache';
import { IUserDocument } from '@user/interfaces/userInterface';

jest.mock('@service/queues/baseQueue');
jest.mock('@service/redis/userCache');
jest.mock('@service/db/userService');

const USERNAME = 'Manny';
const PASSWORD = 'manny1';

describe('CurrentUser', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('token', () => {
        it('should set session token to null and send correct json response', async () => {
            const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue({} as IUserDocument);

            await CurrentUser.prototype.read(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                token: null,
                isUser: false,
                user: null
            });
        });
    });
});
