/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/authMock';
import * as postServer from '@socket/post';
import { newPost, postMockRequest, postMockResponse } from '@root/mocks/postMock';
import { postQueue } from '@service/queues/postQueue';
import { Create } from '@post/controllers/createPost';
import { PostCache } from '@service/redis/postCache';
import { CustomError } from '@global/helpers/errorHandler';
import * as cloudinaryUploads from '@global/helpers/cloudinaryUpload';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');
jest.mock('@service/redis/postCache');
jest.mock('@global/helpers/cloudinaryUpload');

Object.defineProperties(postServer, {
    socketIOPostObject: {
        value: new Server(),
        writable: true
    }
});

describe('Create', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    // After each test, clear mocks and timers
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('post', () => {
        it('should send correct json response', async () => {
            const req: Request = postMockRequest(newPost, authUserPayload) as Request;
            const res: Response = postMockResponse();

            // Spy on socketIOPostObject.emit, PostCache.prototype.savePostToCache, and postQueue.addPostJob
            jest.spyOn(postServer.socketIOPostObject, 'emit');
            const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
            jest.spyOn(postQueue, 'addPostJob');

            await Create.prototype.post(req, res);

            // Get the created post from the spy
            const createdPost = spy.mock.calls[0][0].createdPost;
            expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
            expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
                key: spy.mock.calls[0][0].key,
                currentUserId: `${req.currentUser?.userId}`,
                uId: `${req.currentUser?.uId}`,
                createdPost
            });
            expect(postQueue.addPostJob).toHaveBeenCalledWith('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post created successfully'
            });
        });
    });

    describe('postWithImage', () => {
        it('should throw an error if image is not available', () => {
            delete newPost.image;
            const req: Request = postMockRequest(newPost, authUserPayload) as Request;
            const res: Response = postMockResponse();

            Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Image is a required field');
            });
        });

        it('should throw an upload error', () => {
            // Modify the newPost object to simulate a failed image upload
            newPost.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
            const req: Request = postMockRequest(newPost, authUserPayload) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any =>
                Promise.resolve({ version: '', public_id: '', message: 'Upload error' })
            );

            Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Upload error');
            });
        });

        it('should send correct json response', async () => {
            // Modify the newPost object to include a valid image
            newPost.image = 'testing image';
            const req: Request = postMockRequest(newPost, authUserPayload) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(postServer.socketIOPostObject, 'emit');
            const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
            jest.spyOn(postQueue, 'addPostJob');
            // Mock the cloudinaryUploads.uploads function to simulate a successful image upload
            jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any =>
                Promise.resolve({ version: '1234', public_id: '123456' })
            );

            await Create.prototype.postWithImage(req, res);
            const createdPost = spy.mock.calls[0][0].createdPost;
            expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
            expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
                key: spy.mock.calls[0][0].key,
                currentUserId: `${req.currentUser?.userId}`,
                uId: `${req.currentUser?.uId}`,
                createdPost
            });
            expect(postQueue.addPostJob).toHaveBeenCalledWith('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post created with image successfully'
            });
        });
    });
});
