const mongoose = require("mongoose");
const { default: httpStatus } = require("http-status");
const SuperAdmin = require("../models/superAdmin.model");
const User = require("../models/user.model");
const checkIsSuperAdminEmail = (email) => {    
    const superAdmins = ["jranjan2017@gmail.com", "giri943@gmail.com"]
    if (superAdmins.includes(email)) {
        return "super-admin"
    }
    else {
        return null
    }
}

const createSuperAdmin = ( fullName, email, password ) => {    
    return new Promise(async (resolve, reject) => {
        const isSuperAdmin = checkIsSuperAdminEmail(email);        
        if (!isSuperAdmin) {
            return reject({ statusCode: httpStatus.BAD_REQUEST, message: "Provided email is not authorized for super admin" });
        }
        try {
            const superAdmin = new SuperAdmin({ fullName, email, password });
            await superAdmin.save();
            resolve({ superAdmin: superAdmin.getPublicProfile() });
        } catch (error) {
            reject(error);
        }
    })
}

const login = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const superAdmin = await SuperAdmin.findByEmailCredentials(email, password);
            if (!superAdmin) {
                return reject({ statusCode: httpStatus.UNAUTHORIZED, message: "Invalid email or password" });
            }
            superAdmin.isLoggedIn = true;
            const token = await superAdmin.generateAuthToken();
            await superAdmin.save();
            resolve({ superAdmin: superAdmin.getPublicProfile(), token });
        } catch (error) {
            reject(error);
        }
    })
}

const logout = (superAdmin, token) => {
    return new Promise(async (resolve, reject) => {
        try {
            
            superAdmin.tokens = superAdmin.tokens.filter((t) => t.token !== token);
            superAdmin.isLoggedIn = false;
            await superAdmin.save();
            resolve({ status: true, message: "Logged out successfully" });
        } catch (error) {
            reject(error);
        }
    })
}

const assignRole = ( data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await User.updateMany({ _id: { $in: data.ids } }, { $set: { role: data.role } });
            if (!users.matchedCount === 0) {
                return reject({ statusCode: httpStatus.NOT_FOUND, message: "No users found" });
            }
            resolve(users);
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    createSuperAdmin,
    login,
    logout,
    assignRole
}