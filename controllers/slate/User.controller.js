const crypto = require('crypto');

const User = require('../../models/allow-box/user.model');
const emailerService = require('../../services/mailsender.service')
const generateOTP = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const createSchoolSuperAdmin = (userData, sendEmail = false) => {
    const registrationOtp = generateOTP();
    const password = crypto.randomBytes(16).toString('hex') + 'Aa1!';    
    userData.registrationOtp = registrationOtp;
    userData.password = password;
    userData.role = 'super-admin';
    return new Promise(async (resolve, reject) => {
        try {
            const user = new User(userData);
            await user.save();
            const registrationToken = await user.generateRegistrationToken();
            if (sendEmail) {
                await emailerService.sendEmailVerificationEmail(user.email, user.fullName, 'Verify Your Email', registrationToken);
            }
            resolve( { user:user.getPublicProfile(), registrationToken } );
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    createSchoolSuperAdmin
}