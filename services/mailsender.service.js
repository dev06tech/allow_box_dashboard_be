// utils/mailer.js

const { MailerSend, EmailParams } = require('mailersend');
const config = require('../config/config');

const emailTeamplateController = require('../controllers/slate/EmailTemplate.controller');

const mailerSend = new MailerSend({
    api_key: "mlsn.1ba3d395bdd07833f1b5ca00f9f6f86ef16e89bbe1cba407f37673a0164b414b",
});

const sendEmailVerificationEmail = async ({ toEmail, toName, subject, registrationToken }) => {
    const emailTemplate = await emailTeamplateController.getEmailTemplate('verify-email');
    if (emailTemplate && emailTemplate.emailContent) {
        emailContent = emailTemplate.emailContent;
        emailContent = emailContent.replace("{{fullName}}", toName);

        emailContent = emailContent.replace(
            "{{emailVerificationLink}}",
            `<a href="${config.frontend}/verify-email/${registrationToken}">${config.frontend}/verify-email/${registrationToken}</a>`
        );
    } else {
        throw new Error("Email template 'verify-email' not found.");
    }

    const emailParams = new EmailParams()
        .setFrom(config.mailSender.fromEmail)
        .setReplyTo(config.mailSender.fromEmail)
        .setSubject(subject)
        .setHtml(emailContent)
        .setText(emailContent)
        .setTo(toEmail)

    try {
        const response = await mailerSend.email.send(emailParams);
        return;
    } catch (error) {
        console.log(error);
        
        console.error('MailerSend error:', error?.response?.data || error.message);
        throw new Error('Failed to send email');
    }
};

module.exports = {
    sendEmailVerificationEmail,
};
