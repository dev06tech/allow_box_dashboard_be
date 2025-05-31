const mongoose = require("mongoose");
const { default: httpStatus } = require("http-status");
const SuperAdmin = require("../../models/slate/superAdmin.model");
const User = require("../../models/allow-box/user.model");
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
            
            superAdmin.tokens = []
            superAdmin.isLoggedIn = false;
            await superAdmin.save();
            resolve({ status: true, message: "Logged out successfully" });
        } catch (error) {
            reject(error);
        }
    })
}

const assignRole = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const results = await Promise.allSettled(
                data.ids.map(async (id) => {
                    const updated = await User.findByIdAndUpdate(id, { role: data.role }, { new: true });
                    if (!updated) {
                        throw new Error("User not found");
                    }
                    return { id, user: updated.getPublicProfile() };
                })
            );

            const successes = [];
            const failures = [];

            results.forEach((result, index) => {
                const id = data.ids[index];
                if (result.status === 'fulfilled') {
                    successes.push({
                        id,
                        status: 'fulfilled',
                        user: result.value.user
                    });
                } else {
                    failures.push({
                        id,
                        status: 'rejected',
                        reason: result.reason.message || "Unknown error"
                    });
                }
            });

            resolve({ successes, failures });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    createSuperAdmin,
    login,
    logout,
    assignRole
}