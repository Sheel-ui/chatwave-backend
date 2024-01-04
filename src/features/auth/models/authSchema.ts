import { hash, compare } from 'bcryptjs';
import { IAuthDocument } from '@auth/interfaces/authInterface';
import { model, Model, Schema } from 'mongoose';

const SALT_ROUND = 10;

const authSchema: Schema = new Schema(
    {
        username: { type: String },
        uId: { type: String },
        email: { type: String },
        password: { type: String },
        avatarColor: { type: String },
        createdAt: { type: Date, default: Date.now },
        passwordResetToken: { type: String, default: '' },
        passwordResetExpires: { type: Number }
    },
    {
        // Transforming the document before converting to JSON to remove the password field
        toJSON: {
            transform(_doc, ret) {
                delete ret.password;
                return ret;
            }
        }
    }
);

// Middleware to hash the password before saving the document
authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
    const hashedPassword: string = await hash(this.password as string, SALT_ROUND);
    this.password = hashedPassword;
    next();
});

// Adding custom methods to the schema for comparing and hashing passwords
authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    const hashedPassword: string = (this as unknown as IAuthDocument).password!;
    return compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
    return hash(password, SALT_ROUND);
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('AuthUser', authSchema, 'Auth');
export { AuthModel };
