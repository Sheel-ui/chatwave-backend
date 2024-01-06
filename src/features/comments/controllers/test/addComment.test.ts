import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/authMock';
import { reactionMockRequest, reactionMockResponse } from '@root/mocks/reactionMock';
import { CommentCache } from '@service/redis/commentCache';
import { commentQueue } from '@service/queues/commentQueue';
import { Add } from '@comment/controllers/addComment';
import { existingUser } from '@root/mocks/userMock';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');
jest.mock('@service/redis/commentCache');

describe('Add', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should call savePostCommentToCache and addCommentJob methods', async () => {
        const req: Request = reactionMockRequest(
            {},
            {
                postId: '6027f77087c9d9ccb1555268',
                comment: 'This is a comment',
                profilePicture: 'https://place-hold.it/500x500',
                userTo: `${existingUser._id}`
            },
            authUserPayload
        ) as Request;
        const res: Response = reactionMockResponse();
        jest.spyOn(CommentCache.prototype, 'savePostCommentToCache');
        jest.spyOn(commentQueue, 'addCommentJob');

        await Add.prototype.comment(req, res);
        expect(CommentCache.prototype.savePostCommentToCache).toHaveBeenCalled();
        expect(commentQueue.addCommentJob).toHaveBeenCalled();
    });

    it('should send correct json response', async () => {
        const req: Request = reactionMockRequest(
            {},
            {
                postId: '6027f77087c9d9ccb1555268',
                comment: 'This is a comment',
                profilePicture: 'https://place-hold.it/500x500',
                userTo: `${existingUser._id}`
            },
            authUserPayload
        ) as Request;
        const res: Response = reactionMockResponse();

        await Add.prototype.comment(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Comment created successfully'
        });
    });
});
