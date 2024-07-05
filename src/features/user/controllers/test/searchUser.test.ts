import { Request, Response } from 'express';
import { chatMockRequest, chatMockResponse } from '@root/mocks/chatMock';
import { authUserPayload } from '@root/mocks/authMock';
import { searchedUserMock } from '@root/mocks/userMock';
import { Search } from '@user/controllers/searchUser';
import { userService } from '@service/db/userService';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');
jest.mock('@service/redis/userCache');

describe('Search', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('user', () => {
        it('should send correct json response if searched user exist', async () => {
            const req: Request = chatMockRequest({}, {}, authUserPayload, { query: 'Danny' }) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(userService, 'searchUsers').mockResolvedValue([searchedUserMock]);

            await Search.prototype.user(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Search results',
                search: [searchedUserMock]
            });
        });

        it('should send correct json response if searched user does not exist', async () => {
            const req: Request = chatMockRequest({}, {}, authUserPayload, { query: 'DannyBoy' }) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(userService, 'searchUsers').mockResolvedValue([]);

            await Search.prototype.user(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Search results',
                search: []
            });
        });
    });
});
