import { IAuthDocument } from '@auth/interfaces/authInterface';
import { AuthModel } from '@auth/models/authSchema';
import { Helpers } from '@global/helpers/helpers';

class AuthService {
    // Creating an authentication user in the database
    public async createAuthUser(data: IAuthDocument): Promise<void> {
        await AuthModel.create(data);
    }

    // Getting a user by username or email
    public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
        const query = {
            $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
        };
        const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
        return user;
    }

    // Getting a user by username
    public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
        const user: IAuthDocument = (await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username) }).exec()) as IAuthDocument;
        return user;
    }
}

export const authService: AuthService = new AuthService();
