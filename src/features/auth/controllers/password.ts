import { Request, Response } from 'express';
import { config } from '@root/config';
import moment from 'moment';
import publicIP from 'ip';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@service/db/authService';
import { IAuthDocument } from '@auth/interfaces/authInterface';
import { joiValidation } from '@global/decorators/joiValidationDecorators';
import { emailSchema, passwordSchema } from '@auth/schemes/password';
import crypto from 'crypto';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgotPassword';
import { emailQueue } from '@service/queues/emailQueue';
import { IResetPasswordParams } from '@user/interfaces/userInterface';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/resetPassword';
import { BadRequestError } from '@global/helpers/errorHandler';

export class Password {
    // Endpoint for creating a password reset request
    @joiValidation(emailSchema)
    public async create(req: Request, res: Response): Promise<void> {
        const { email } = req.body;
        const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        // Generate a random token for password reset
        const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
        const randomCharacters: string = randomBytes.toString('hex');

        // Update user's password reset token in the database
        await authService.updatePasswordToken(`${existingUser._id!}`, randomCharacters, Date.now() * 60 * 60 * 1000);

        // Construct the password reset link and email template
        const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
        const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);
        emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset your password' });
        res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
    }

    // Endpoint for updating the password after a reset
    @joiValidation(passwordSchema)
    public async update(req: Request, res: Response): Promise<void> {
        const { password, confirmPassword } = req.body;
        const { token } = req.params;
        if (password !== confirmPassword) {
            throw new BadRequestError('Passwords do not match');
        }
        const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
        if (!existingUser) {
            throw new BadRequestError('Reset token has expired.');
        }

        // Update user's password and clear password reset fields in the database
        existingUser.password = password;
        existingUser.passwordResetExpires = undefined;
        existingUser.passwordResetToken = undefined;
        await existingUser.save();

        // Construct the confirmation email template
        const templateParams: IResetPasswordParams = {
            username: existingUser.username!,
            email: existingUser.email!,
            ipaddress: publicIP.address(),
            date: moment().format('DD//MM//YYYY HH:mm')
        };
        const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);

        // Add the confirmation email job to the queue
        emailQueue.addEmailJob('forgotPasswordEmail', {
            template,
            receiverEmail: existingUser.email!,
            subject: 'Password Reset Confirmation'
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
    }
}
