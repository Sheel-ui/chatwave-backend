/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import * as cloudinaryUploads from '@global/helpers/cloudinaryUpload';
import { SignUp } from '@auth/controllers/signup';
import { CustomError } from '@global/helpers/errorHandler';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/authMock';
import { authService } from '@service/db/authService';
import { UserCache } from '@service/redis/userCache';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');
jest.mock('@service/redis/userCache');
jest.mock('@service/queues/userQueue');
jest.mock('@service/queues/authQueue');
jest.mock('@global/helpers/cloudinaryUpload');

describe('SignUp', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should throw an error if username is not available', () => {
        const req: Request = authMockRequest(
            {},
            {
                username: '',
                email: 'test@test.com',
                password: 'abcdef',
                avatarColor: 'red',
                avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==abcd'
            }
        ) as Request;
        const res: Response = authMockResponse();

        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Username is a required field');
        });
    });

    it('should throw an error if username length is less than minimum length', () => {
        const req: Request = authMockRequest(
            {},
            {
                username: 'te',
                email: 'test@test.com',
                password: 'abcdef',
                avatarColor: 'red',
                avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==abcd'
            }
        ) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid username');
        });
    });

    it('should throw an error if username length is greater than maximum length', () => {
        const req: Request = authMockRequest(
            {},
            {
                username: 'test123456',
                email: 'test@test.com',
                password: 'abcdef',
                avatarColor: 'red',
                avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==abcd'
            }
        ) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid username');
        });
    });

    it('should throw an error if email is not valid', () => {
        const req: Request = authMockRequest(
            {},
            {
                username: 'test',
                email: 'test',
                password: 'abcdef',
                avatarColor: 'red',
                avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==abcd'
            }
        ) as Request;
        const res: Response = authMockResponse();

        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Email must be valid');
        });
    });

    it('should throw an error if email is not available', () => {
        const req: Request = authMockRequest(
            {},
            {
                username: 'test',
                email: '',
                password: 'abcdef',
                avatarColor: 'red',
                avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==abcd'
            }
        ) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Email is a required field');
        });
    });

    it('should throw an error if password is not available', () => {
        const req: Request = authMockRequest(
            {},
            {
                username: 'test',
                email: 'test@test.com',
                password: '',
                avatarColor: 'red',
                avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==abcd'
            }
        ) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Password is a required field');
        });
    });

    it('should throw an error if password length is less than minimum length', () => {
        const req: Request = authMockRequest(
            {},
            {
                username: 'test',
                email: 'test@test.com',
                password: 'ab',
                avatarColor: 'red',
                avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==abcd'
            }
        ) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid password');
        });
    });

    it('should throw an error if password length is greater than maximum length', () => {
        const req: Request = authMockRequest(
            {},
            {
                username: 'test',
                email: 'test@test.com',
                password: 'abcdefghijklmnop',
                avatarColor: 'red',
                avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==abcd'
            }
        ) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid password');
        });
    });

    it('should throw unauthorize error is user already exist', () => {
        const req: Request = authMockRequest(
            {},
            {
                username: 'test',
                email: 'test@test.com',
                password: 'qwerty',
                avatarColor: 'red',
                avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
            }
        ) as Request;
        const res: Response = authMockResponse();

        jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid credentials');
        });
    });

    it('should set session data for valid credentials and send correct json response', async () => {
        const req: Request = authMockRequest(
            {},
            {
                username: 'test',
                email: 'test@test.com',
                password: 'qwerty',
                avatarColor: 'red',
                avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
            }
        ) as Request;
        const res: Response = authMockResponse();

        jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
        const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
        jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any =>
            Promise.resolve({ version: '1234737373', public_id: '123456' })
        );

        await SignUp.prototype.create(req, res);
        expect(req.session?.jwt).toBeDefined();
        expect(res.json).toHaveBeenCalledWith({
            message: 'User created successfully',
            user: userSpy.mock.calls[0][2],
            token: req.session?.jwt
        });
    });
});
