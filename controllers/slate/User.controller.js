const crypto = require('crypto');
const { default: httpStatus } = require('http-status');
const config = require('../../config/config');

const User = require('../../models/allow-box/user.model');
const emailerService = require('../../services/mailsender.service')
const generateOTP = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const createAllowBoxUser = (userData, sendEmail = config.nodeMailer.activeStatus) => {
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
const updateAllowBoxUser = (userUpdates) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOneAndUpdate({ _id: userUpdates._id }, userUpdates, { new: true });
            resolve(user.getPublicProfile());
        } catch (error) {
            reject(error);
        }
    })
}

const deleteAllowBoxUser = (userData) => {
    const userId = userData.userId
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findByIdAndDelete({ _id: userId });
            if (!user) {
                return reject({ statusCode: httpStatus.NOT_FOUND, message: "User not found" });
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

const getAllowBoxUsers = async (page, limit) => {
    try {
        const skip = (page - 1) * limit;
        const [users, totalCount] = await Promise.all([
            User.find()
                .select('_id fullName email role associatedSchool').lean()
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments()
        ]);

        return {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalUsers: totalCount,
            users,
        };
    } catch (error) {
        throw error;
    }
};

const getAllowBoxUser = async (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return reject({ statusCode: httpStatus.NOT_FOUND, message: "User not found" });
            }
            resolve(user.getPublicProfile());
        } catch (error) {
            reject(error);
        }
    })
}
 

module.exports = {
    createAllowBoxUser,
    updateAllowBoxUser,
    deleteAllowBoxUser,
    getAllowBoxUsers,
    getAllowBoxUser
}