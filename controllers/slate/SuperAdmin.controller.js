const mongoose = require("mongoose");
const { default: httpStatus } = require("http-status");
const SuperAdmin = require("../../models/slate/superAdmin.model");
const User = require("../../models/allow-box/user.model");
const School = require("../../models/allow-box/school.model");

const now = new Date();
const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const startOfYear = new Date(now.getFullYear(), 0, 1);
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

const addGrowthPercentage = (incomingData) => {
    const data = incomingData.monthlyRevenueOverview
    const totalSchoolsRevenue = incomingData.totalSchoolsRevenue
    return data.map((item, index, arr) => {
        if (index === 0) {
            return { ...item, revenueGrowth: 0 };
        }
        const prev = arr[index - 1];
        const growth = prev.totalRevenue === 0
            ? 100
            : ((totalSchoolsRevenue - prev.totalRevenue) / prev.totalRevenue) * 100;

        return {
            ...item,
            revenueGrowth: parseFloat(growth.toFixed(2))
        };
    });
};

const getDashboardData = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const [userStatusResult, schoolStatsResult] = await Promise.all([
                User.aggregate([
                    {
                        $match: {
                            isEmailVerified: true,
                            isBlocked: false
                        }
                    },
                    {
                        $facet: {
                            totalActiveUsers: [
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ],
                            activeUsersTillLastMonth: [
                                {
                                    $match: {
                                        createdAt: { $lt: startOfThisMonth }
                                    }
                                },
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ],
                            totalSuperAdminUsers: [
                                { $match: { role: "super-admin" } },
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ],
                            totalTeacherUsers: [
                                { $match: { role: "teacher" } },
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ],
                            totalStudentUsers: [
                                { $match: { role: "student" } },
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ],
                            totalStudentsTillLastMonth: [
                                {
                                    $match: {
                                        role: "student",
                                        createdAt: { $lt: startOfThisMonth }
                                    }
                                },
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ],
                            totalParentUsers: [
                                { $match: { role: "parent" } },
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ],
                            totalSupportUsers: [
                                { $match: { role: "support" } },
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ],
                            totalStaffUsers: [
                                { $match: { role: "staff" } },
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ]
                        }
                    },
                    {
                        $project: {
                            totalActiveUsers: { $ifNull: [{ $arrayElemAt: ["$totalActiveUsers.count", 0] }, 0] },
                            activeUsersTillLastMonth: { $ifNull: [{ $arrayElemAt: ["$activeUsersTillLastMonth.count", 0] }, 0] },
                            totalSuperAdminUsers: { $ifNull: [{ $arrayElemAt: ["$totalSuperAdminUsers.count", 0] }, 0] },
                            totalTeacherUsers: { $ifNull: [{ $arrayElemAt: ["$totalTeacherUsers.count", 0] }, 0] },
                            totalStudentUsers: { $ifNull: [{ $arrayElemAt: ["$totalStudentUsers.count", 0] }, 0] },
                            totalParentUsers: { $ifNull: [{ $arrayElemAt: ["$totalParentUsers.count", 0] }, 0] },
                            totalSupportUsers: { $ifNull: [{ $arrayElemAt: ["$totalSupportUsers.count", 0] }, 0] },
                            totalStaffUsers: { $ifNull: [{ $arrayElemAt: ["$totalStaffUsers.count", 0] }, 0] },
                            activeUserGrowthFromLastMonth: {
                                $subtract: [
                                    { $ifNull: [{ $arrayElemAt: ["$totalActiveUsers.count", 0] }, 0] },
                                    { $ifNull: [{ $arrayElemAt: ["$activeUsersTillLastMonth.count", 0] }, 0] }
                                ]
                            },
                            totalStudentGrowthFromLastMonth: {
                                $subtract: [
                                    { $ifNull: [{ $arrayElemAt: ["$totalStudentUsers.count", 0] }, 0] },
                                    { $ifNull: [{ $arrayElemAt: ["$totalStudentsTillLastMonth.count", 0] }, 0] }
                                ]
                            }
                        }
                    }
                ]),

                School.aggregate([
                    {
                        $match: {
                            paymentStatus: true,
                            subscriptionEndDate: { $gte: now }
                        }
                    },
                    {
                        $facet: {
                            monthlyRevenueOverview: [
                                {
                                    $match: {
                                        subscriptionAmount: { $gt: 0 },
                                        subscriptionStartDate: { $gte: startOfYear }
                                    }
                                },
                                {
                                    $group: {
                                        _id: {
                                            year: { $year: "$subscriptionStartDate" },
                                            month: { $month: "$subscriptionStartDate" }
                                        },
                                        totalRevenue: { $sum: "$subscriptionAmount" },
                                        schoolCount: { $sum: 1 }
                                    }
                                },
                                { $sort: { "_id.year": 1, "_id.month": 1 } },
                                {
                                    $project: {
                                        _id: 0,
                                        year: "$_id.year",
                                        month: "$_id.month",
                                        monthName: { 
                                            $switch: {
                                                branches: [
                                                    { case: { $eq: ["$_id.month", 1] }, then: "January" },
                                                    { case: { $eq: ["$_id.month", 2] }, then: "February" },
                                                    { case: { $eq: ["$_id.month", 3] }, then: "March" },
                                                    { case: { $eq: ["$_id.month", 4] }, then: "April" },
                                                    { case: { $eq: ["$_id.month", 5] }, then: "May" },
                                                    { case: { $eq: ["$_id.month", 6] }, then: "June" },
                                                    { case: { $eq: ["$_id.month", 7] }, then: "July" },
                                                    { case: { $eq: ["$_id.month", 8] }, then: "August" },
                                                    { case: { $eq: ["$_id.month", 9] }, then: "September" },
                                                    { case: { $eq: ["$_id.month", 10] }, then: "October" },
                                                    { case: { $eq: ["$_id.month", 11] }, then: "November" },
                                                    { case: { $eq: ["$_id.month", 12] }, then: "December" }
                                                ],
                                                default: "Unknown"
                                            }
                                        },
                                        totalRevenue: 1,
                                        schoolCount: 1
                                    }
                                },
                                {
                                    $addFields: {
                                        isCurrentMonth: {
                                            $and: [
                                                { $eq: ["$year", now.getFullYear()] },
                                                { $eq: ["$month", now.getMonth() + 1] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            totalActiveSchools: [
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ],
                            totalSchoolsOnLastMonth: [
                                {
                                    $match: { createdAt: { $lt: startOfThisMonth } }
                                },
                                { $group: { _id: null, count: { $sum: 1 } } }
                            ],
                            totalSchoolsRevenue: [
                                {
                                    $match: {
                                        subscriptionAmount: { $gt: 0 },
                                        subscriptionStartDate: { $gte: startOfYear }
                                    }
                                },
                                {
                                    $group: {
                                        _id: null,
                                        totalRevenue: { $sum: "$subscriptionAmount" },
                                        schoolCount: { $sum: 1 }
                                    }
                                }
                            ],
                            totalSchoolsRevenueUptoLastMoth: [
                                {
                                    $match: {
                                        subscriptionAmount: { $gt: 0 },
                                        subscriptionStartDate: { $lt: startOfThisMonth }
                                    }
                                },
                                {
                                    $group: {
                                        _id: null,
                                        totalRevenue: { $sum: "$subscriptionAmount" },
                                        schoolCount: { $sum: 1 }
                                    }
                                }
                            ]

                        }
                    },
                    {
                        $project: {
                            monthlyRevenueOverview: 1,
                            totalSchoolsRevenue: { $ifNull: [{ $arrayElemAt: ["$totalSchoolsRevenue.totalRevenue", 0] }, 0] },
                            totalActiveSchools: { $ifNull: [{ $arrayElemAt: ["$totalActiveSchools.count", 0] }, 0] },
                            totalSchoolsOnLastMonth: { $ifNull: [{ $arrayElemAt: ["$totalSchoolsOnLastMonth.count", 0] }, 0] },
                            toltalSchoolGrowthFromLastMonth: {
                                $subtract: [
                                    { $ifNull: [{ $arrayElemAt: ["$totalActiveSchools.count", 0] }, 0] },
                                    { $ifNull: [{ $arrayElemAt: ["$totalSchoolsOnLastMonth.count", 0] }, 0] }
                                ]
                            }
                        }
                    }
                ])
            ]);
            let schoolStats = schoolStatsResult[0];
            schoolStats.monthlyRevenueOverview = addGrowthPercentage(schoolStats);
            resolve({ userStatus: userStatusResult[0], schoolStats: schoolStatsResult[0] });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    createSuperAdmin,
    login,
    logout,
    assignRole,
    getDashboardData
}