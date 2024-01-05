/* eslint-disable @typescript-eslint/no-explicit-any */
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/authMock';
import { Request, Response } from 'express';
import { CustomError } from '@global/helpers/errorHandler';
import { SignIn } from '@auth/controllers/signin';
import { Helpers } from '@global/helpers/helpers';
import { authService } from '@service/db/authService';

const USERNAME = 'Test';
const PASSWORD = 'qwerty1';
const WRONG_USERNAME = 'te';
const WRONG_PASSWORD = 'qw';
const LONG_PASSWORD = 'qwerty12345';
const LONG_USERNAME = 'test12345';

jest.useFakeTimers();
jest.mock('@service/queues/baseQueue');

describe('SignIn', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should throw an error if username is not available', () => {
        const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignIn.prototype.read(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Username is a required field');
        });
    });

    it('should throw an error if username length is less than minimum length', () => {
        const req: Request = authMockRequest({}, { username: WRONG_USERNAME, password: WRONG_PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignIn.prototype.read(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid username');
        });
    });

    it('should throw an error if username length is greater than maximum length', () => {
        const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: WRONG_PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignIn.prototype.read(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid username');
        });
    });

    it('should throw an error if password is not available', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request;
        const res: Response = authMockResponse();
        SignIn.prototype.read(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Password is a required field');
        });
    });

    it('should throw an error if password length is less than minimum length', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, password: WRONG_PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignIn.prototype.read(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid password');
        });
    });

    it('should throw an error if password length is greater than maximum length', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignIn.prototype.read(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid password');
        });
    });

    it('should throw "Invalid credentials" if username does not exist', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null as any);

        SignIn.prototype.read(req, res).catch((error: CustomError) => {
            expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(Helpers.firstLetterUppercase(req.body.username));
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid credentials');
        });
    });

    it('should throw "Invalid credentials" if password does not exist', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null as any);

        SignIn.prototype.read(req, res).catch((error: CustomError) => {
            expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(Helpers.firstLetterUppercase(req.body.username));
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid credentials');
        });
    });
});
