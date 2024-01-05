import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@user/interfaces/user.interface';

class ResetPasswordTemplate {
    public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
        const { username, email, ipaddress, date } = templateParams;
        // Read EJS template file and render it with the provided parameters
        return ejs.render(fs.readFileSync(__dirname + '/resetPassword.ejs', 'utf8'), {
            username,
            email,
            ipaddress,
            date,
            image_url:
                'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
        });
    }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
