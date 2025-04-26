const config = require("../config/config")
const logger = require("../config/logger")
const User = require("../models/user.model")
const EmailTemplate = require("../models/emailTempate.model")
const googleAuthService = require("../services/google.service")
const { default: httpStatus } = require("http-status")
const crypto = require("crypto")


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

const createUser = (userData) => {
    const { fullName, email, password } = userData;
    const registrationOtp = generateOTP();
    const newUser = {
        fullName,
        email,
        password,
        registrationOtp,
    };
    return new Promise(async (resolve, reject) => {
        try {
            let user = new User(newUser);
            await user.save();
            const registrationToken = await user.generateRegistrationToken();
            user = user.getPublicProfile();
            resolve({ user, registrationToken });
        } catch (error) {
            reject(error);
        }
    })
}

const verifyEmailAndOtp = (email, otp) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email, registrationOtp: otp });
            if (!user) {
                return reject({
                    statusCode: httpStatus.BAD_REQUEST,
                    message: "Invalid OTP or email provided"
                });
            }
            if (user.isEmailVerified) {
                return reject({
                    statusCode: httpStatus.BAD_REQUEST,
                    message: "Email already verified"
                });
            }
            user.isEmailVerified = true;
            await user.save();
            resolve(user.getPublicProfile());
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

const logout = (user, token) => {
    return new Promise(async (resolve, reject) => {
        try {
            user.tokens = user.tokens.filter((t) => t.token !== token);
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

const changePassword = (email, oldPassWord, newPassword) => {    
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findByEmailCredentials(email, oldPassWord);
            user.password = newPassword;
            user.isLoggedIn = false;
            user.tokens = [];
            await user.save();
            resolve(user.getPublicProfile());
        } catch (error) {
            reject(error);
        }
    })
}

const forgotPassword = (email) => {
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
            const emailTemplate = await EmailTemplate.findOne({ type: "reset-password" });
            if (emailTemplate && emailTemplate.emailContent) {
                let emailContent = emailTemplate.emailContent;
                emailContent = emailTemplate.emailContent.replace("{{passwordResetToken}}",
                    `<a href="${config.frontend}/password-reset/${passwordResetToken}">${config.frontend}/password-reset/${passwordResetToken}</a>`
                );
                emailTemplate.emailContent = emailContent;                
            }
            resolve({ user: user.getPublicProfile(), emailTemplate });
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    createUser,
    verifyEmailAndOtp,
    login,
    logout,
    processGoogleAuth,
    changePassword,
    forgotPassword
};