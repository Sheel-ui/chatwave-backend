import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';

class UserService {
    // Method for adding user data to the database
    public async addUserData(data: IUserDocument): Promise<void> {
        await UserModel.create(data);
    }
}

export const userService: UserService = new UserService();
