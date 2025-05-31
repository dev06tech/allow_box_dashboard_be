const config = require("../../config/config")
const logger = require("../../config/logger")
const User = require("../../models/allow-box/user.model")
const EmailTemplate = require("../../models/slate/emailTempate.model")
const googleAuthService = require("../../services/google.service")
const { default: httpStatus } = require("http-status")
const crypto = require("crypto")
const { getSchoolByIdAndAddSuperAdmin } = require("../../controllers/allow-box/School.controller")

const emailService = require("../../services/mailsender.service")

// const checkIsSuperAdminEmail = (email) => {
//     //super admin and admin roles can only access 

//     const superAdmins = ["jranjan2017@gmail.com", "giri943@gmail.com"]
//     if (superAdmins.includes(email)) {
//         return "super-admin"
//     }
//     else {
//         return null
//     }
// }
const generateOTP = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const createUser = (userData, sendEmail = config.nodeMailer.activeStatus) => {
    return new Promise(async (resolve, reject) => {
        const password = config.nodeEnvironment === 'development'
            ? 'Admin@123'
            : crypto.randomBytes(16).toString('hex') + 'Aa1!'; userData.password = password;
        try {
            const user = new User(userData);
            await user.save();
            const registrationToken = await user.generateRegistrationToken();
            user.registrationToken = registrationToken
            user.password = password
            if (sendEmail) {
                emailService.triggerEmail('verify-email', user, 'Verify Your Email')
                .catch((err) => {
                    logger.error(err)
                })
            }
            resolve({ user: user.getPublicProfile() });
        } catch (error) {
            reject(error);
        }
    })
}

const verifyEmail = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            user.isEmailVerified = true;
            await user.save();
            resolve(user.getPublicProfile());
        } catch (error) {
            reject(error);
        }
    })
}

const resendVerificationEmail = (email, sendEmail=config.nodeMailer.activeStatus) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return reject({
                    statusCode: httpStatus.BAD_REQUEST,
                    message: "User not found"
                });
            }
            if (user.isEmailVerified) {
                return reject({
                    statusCode: httpStatus.BAD_REQUEST,
                    message: "Email already verified"
                });
            }
            const registrationToken = await user.generateRegistrationToken();
            user.registrationToken = registrationToken
            if(sendEmail){
                emailService.triggerEmail('verify-email', user, 'Verify Your Email')
                .catch((err) => {
                    console.error('Failed to send verification email:', err.message);
                })
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

const login = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findByEmailCredentials(email, password);
            if (!user.isEmailVerified) {
                return reject({
                    statusCode: httpStatus.FORBIDDEN,
                    message: "Please verify your email first"
                });
            }
            let token = await user.generateAuthToken();
            resolve({ user: user.getPublicProfile(), token });
        } catch (error) {
            reject(error);
        }
    })
}

const logout = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            user.tokens = []
            user.isLoggedIn = false;
            await user.save();
            resolve(user.getPublicProfile());
        } catch (error) {
            reject(error);
        }
    })
}

const processGoogleAuth = async (code) => {
    try {
        const googleProfile = await googleAuthService.verifyGoogleToken(code);
        const { name, email, isEmailVerified, hd } = googleProfile;
        let user = await User.findOne({ email });
        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString('hex') + 'Aa1!';
            user = new User({
                fullName: name,
                email,
                password: randomPassword,
                isEmailVerified: isEmailVerified ? true : false,
                registeredVia: 'google',
                isLoggedIn: true,
            });
            await user.save();
            await user.generateRegistrationToken();
            const authToken = await user.generateAuthToken();
            return { user: user.getPublicProfile(), token: authToken };
        }
        user.isEmailVerified = isEmailVerified ? true : false;
        user.isLoggedIn = true;
        await user.save();
        const authToken = await user.generateAuthToken();
        return { user: user.getPublicProfile(), token: authToken };

    } catch (error) {
        logger.error(`Google auth processing error: ${error.message}`);
        throw {
            statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            message: error.message
        };
    }
};

const changePassword = (newPassword, user, sendEmail = config.nodeMailer.activeStatus) => {
    return new Promise(async (resolve, reject) => {
        try {
            user.password = newPassword;
            user.isLoggedIn = false;
            user.tokens = [];
            user.passwordResetToken = null;
            await user.save();
            user.password = newPassword;
            if (sendEmail) {
                emailService.triggerEmail('password-changed', user, 'Password Changed')
                    .catch((err) => {
                        console.error('Failed to send password change email:', err.message);
                    });
            }
            resolve(user.getPublicProfile());
        } catch (error) {
            reject(error);
        }
    })
}
const resetPassword = (email, sendEmail = config.nodeMailer.activeStatus ) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return reject({
                    statusCode: httpStatus.NOT_FOUND,
                    message: "User not found"
                });
            }
            const passwordResetToken = await user.generatePasswordResetToken();
            user.passwordResetToken = passwordResetToken;
            if (sendEmail) {
                emailService.triggerEmail('reset-password', user, 'Reset Your Password')
                .catch((err) => {
                    console.error('Failed to send password reset email:', err.message);
                })
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

const updateAllowBoxUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOneAndUpdate({ _id: data._id }, data, { new: true });
            resolve(user.getPublicProfile());
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    createUser,
    verifyEmail,
    login,
    logout,
    processGoogleAuth,
    changePassword,
    resetPassword,
    resendVerificationEmail,
    updateAllowBoxUser
};