import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/authMock';
import { Update } from '@chat/controllers/updateChatMsg';
import { Server } from 'socket.io';
import * as chatServer from '@socket/chat';
import { chatMockRequest, chatMockResponse } from '@root/mocks/chatMock';
import { existingUser } from '@root/mocks/userMock';
import { MessageCache } from '@service/redis/messageCache';
import { chatQueue } from '@service/queues/chatQueue';
import { messageDataMock } from '@root/mocks/chatMock';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');
jest.mock('@service/redis/messageCache');

Object.defineProperties(chatServer, {
    socketIOChatObject: {
        value: new Server(),
        writable: true
    }
});

describe('Update', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('message', () => {
        it('should send correct json response from redis cache', async () => {
            const req: Request = chatMockRequest(
                {},
                {
                    senderId: `${existingUser._id}`,
                    receiverId: '60263f14648fed5246e322d8'
                },
                authUserPayload
            ) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(MessageCache.prototype, 'updateChatMessages').mockResolvedValue(messageDataMock);
            jest.spyOn(chatServer.socketIOChatObject, 'emit');

            await Update.prototype.message(req, res);
            expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
            expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('message read', messageDataMock);
            expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('chat list', messageDataMock);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Message marked as read'
            });
        });

        it('should call chatQueue addChatJob', async () => {
            const req: Request = chatMockRequest(
                {},
                {
                    senderId: `${existingUser._id}`,
                    receiverId: '60263f14648fed5246e322d8'
                },
                authUserPayload
            ) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(MessageCache.prototype, 'updateChatMessages').mockResolvedValue(messageDataMock);
            jest.spyOn(chatQueue, 'addChatJob');

            await Update.prototype.message(req, res);
            expect(chatQueue.addChatJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Message marked as read'
            });
        });
    });
});
