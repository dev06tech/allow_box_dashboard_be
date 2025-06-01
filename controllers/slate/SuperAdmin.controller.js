const mongoose = require("mongoose");
const { default: httpStatus } = require("http-status");
const SuperAdmin = require("../../models/slate/superAdmin.model");
const User = require("../../models/allow-box/user.model");
const School = require("../../models/allow-box/school.model");

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const startOfThisMonth = new Date(currentYear, currentMonth, 1);
const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
const checkIsSuperAdminEmail = (email) => {
    const superAdmins = ["jranjan2017@gmail.com", "giri943@gmail.com", "dev08.tech@gmail.com"]
    if (superAdmins.includes(email)) {
        return "super-admin"
    }
    else {
        return null
    }
}

const createSuperAdmin = (fullName, email, password) => {
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

const getDashboardData = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const totalActiveUsers = await User.countDocuments({ isEmailVerified: true, isLoggedIn: true, isBlocked: false });
            const schoolStats = await School.aggregate([
                {
                    $facet: {
                        monthlyRevenue: [
                            {
                                $match: {
                                    paymentStatus: true,
                                    subscriptionAmount: { $gt: 0 },
                                    subscriptionStartDate: { $lte: now },
                                    subscriptionEndDate: { $gte: now }
                                }
                            },
                            {
                                $group: {
                                    _id: {
                                        year: { $year: "$createdAt" },
                                        month: { $month: "$createdAt" }
                                    },
                                    totalRevenue: { $sum: "$subscriptionAmount" },
                                    schoolCount: { $sum: 1 }
                                }
                            },
                            {
                                $sort: {
                                    "_id.year": -1,
                                    "_id.month": -1
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    totalRevenue: 1,
                                    schoolCount: 1
                                }
                            }
                        ],
                        totalActiveSchools: [
                            {
                                $match: {
                                    paymentStatus: true,
                                    subscriptionEndDate: {
                                        $gte: now
                                    }
                                }
                            },
                            {
                                $count: "count"
                            }
                        ],
                        schoolsLastMonth: [
                            {
                                $match: {
                                    createdAt: { $lt: startOfThisMonth }
                                }
                            },
                            { $count: "count" }
                        ]
                    }
                },
                {
                    $project: {
                        monthlyRevenue: 1,
                        totalActiveSchools: { $arrayElemAt: ["$totalActiveSchools.count", 0] },
                        schoolsLastMonth: { $ifNull: [{ $arrayElemAt: ["$schoolsLastMonth.count", 0] }, 0] },
                        growthFromLastMonth: {
                            $subtract: [
                                { $ifNull: [{ $arrayElemAt: ["$totalSchools.count", 0] }, 0] },
                                { $ifNull: [{ $arrayElemAt: ["$schoolsThisMonth.count", 0] }, 0] }
                            ]
                        }
                    }
                }
            ]);

            resolve({ totalActiveUsers, schoolStats });
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    createSuperAdmin,
    login,
    logout,
    assignRole,
    getDashboardData
}