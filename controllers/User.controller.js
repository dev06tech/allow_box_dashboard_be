const logger = require("../config/logger")
const User = require("../models/user.model")

const getUserRole = (email) => {
    //super admin and admin roles can only access 

    const superAdmins = ["jranjan2017@gmail.com", "giri943@gmail.com"]
    const admins = ["girish.soman@schbang.com", "jyoti.biswal@schbang.com"]
    if (superAdmins.includes(email)) {
        return "super-admin"
    }
    else if (admins.includes(email)) {
        return "admin"
    }
    else {
        return null
    }
}
const generateOTP = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


const createUser = (userData) => {
    const { fullName, email, password, selectedRole } = userData;
    const roleCheck = getUserRole(email);
    const role = roleCheck ? roleCheck : selectedRole;
    const registrationOtp = generateOTP();
    const newUser = {
        fullName,
        email,
        password,
        role,
        registrationOtp,
    };
    return new Promise(async (resolve, reject) => {
        try {
            let user = new User(newUser);
            await user.save();
            let token = await user.generateRegistrationToken();
            user = user.getPublicProfile();
            resolve({ user, token });
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
                return reject(new Error("Invalid OTP or email provided"));
            }
            user.isEmailVerified = true;
            user.save()
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
                return reject(new Error("Please verify your email first"));
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

module.exports = {
    createUser,
    verifyEmailAndOtp,
    login,
    logout
};