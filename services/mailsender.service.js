// utils/mailer.js
const nodemailer = require('nodemailer');

const config = require('../config/config');

const emailTeamplateController = require('../controllers/slate/EmailTemplate.controller');
const logger = require('../config/logger');
const { log } = require('winston');

const transporter = nodemailer.createTransport({
    host: config.nodeMailer.host,
    port: config.nodeMailer.port,
    secure: config.nodeMailer.secure,
    auth: {
        user: config.nodeMailer.username,
        pass: config.nodeMailer.password
    },
});

const triggerEmail = async (templateType, userData, subject) => {
    if (templateType === 'verify-email') {
        const emailTemplate = await emailTeamplateController.getEmailTemplate(templateType);
        if (emailTemplate && emailTemplate.emailContent) {
            emailContent = emailTemplate.emailContent;
            emailContent = emailContent.replace("{{fullName}}", userData.fullName);
            emailContent = emailContent.replace(
                "{{emailVerificationLink}}",
                `<a href="${config.frontend}/verify-email/${userData.registrationToken[0].token}">${config.frontend}/verify-email/${userData.registrationToken[0].token}</a>`
            );
            emailContent = emailContent.replace("{{username}}", userData.email);
            emailContent = emailContent.replace("{{password}}", userData.password);
        }
        else {
            throw new Error(`Email template ${templateType} not found.`);
        }
    }
    if (templateType === 're-verify-email') {
        const emailTemplate = await emailTeamplateController.getEmailTemplate(templateType);
        if (emailTemplate && emailTemplate.emailContent) {
            emailContent = emailTemplate.emailContent;
            emailContent = emailContent.replace("{{fullName}}", userData.fullName);
            emailContent = emailContent.replace(
                "{{emailVerificationLink}}",
                `<a href="${config.frontend}/verify-email/${userData.registrationToken[0].token}">${config.frontend}/verify-email/${userData.registrationToken[0].token}</a>`
            );
        }
        else {
            throw new Error(`Email template ${templateType} not found.`);
        }

    }
    if (templateType === 'password-changed') {
        const emailTemplate = await emailTeamplateController.getEmailTemplate(templateType);
        if (emailTemplate && emailTemplate.emailContent) {
            emailContent = emailTemplate.emailContent;
            emailContent = emailContent.replace("{{newPassword}}", userData.password);
        }
        else {
            throw new Error(`Email template ${templateType} not found.`);
        }

    }
    const mailOptions = {
        from: config.nodeMailer.fromEmail,
        to: userData.email,
        subject,
        html: emailContent,
        text: emailContent.replace(/<[^>]+>/g, ''), // Fallback plain text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent to ${mailOptions.to}: ${info.messageId}`);
        return;
    } catch (error) {
        console.log(error);
        console.error('Nodemailer  error:', error?.response?.data || error.message);
        throw new Error('Failed to send email');
    }
};

module.exports = {
    triggerEmail,
};
