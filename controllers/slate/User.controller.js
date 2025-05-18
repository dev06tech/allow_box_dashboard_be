const crypto = require('crypto');
const config = require('../../config/config');

const User = require('../../models/allow-box/user.model');
const emailerService = require('../../services/mailsender.service')
const generateOTP = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const createUser = (userData, sendEmail = config.nodeMailer.activeStatus) => {
    const password = config.nodeEnvironment === 'development'
        ? 'Admin@123'
        : crypto.randomBytes(16).toString('hex') + 'Aa1!';
    userData.password = password;
    return new Promise(async (resolve, reject) => {
        try {
            const user = new User(userData);
            await user.save();
            const registrationToken = await user.generateRegistrationToken();
            user.registrationToken = registrationToken
            user.password = password
            if (sendEmail) {
                emailerService.triggerEmail('verify-email', user, 'Verify Your Email')
                .catch((err) => {
                    console.error('Failed to send verification email:', err.message);
                })
            }
            resolve({ user: user.getPublicProfile(), registrationToken });
        } catch (error) {
            reject(error);
        }
    })
}
const updateUser = (userUpdates) => {
    return new Promise(async (resolve, reject) => {
        try {
            const updatedUser = await User.findOneAndUpdate({ _id: userUpdates._id }, userUpdates, { new: true });
            resolve(updatedUser);
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    createUser,
    updateUser
}