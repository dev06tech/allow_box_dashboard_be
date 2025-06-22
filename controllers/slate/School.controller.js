
const School = require('../../models/allow-box/school.model');
const Class = require('../../models/allow-box/class.model');

const createSchool = (schoolData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const school = new School(schoolData);
            await school.save();
            resolve(school);
        } catch (error) {
            reject(error);
        }
    })
}

const getAllowBoxSchools = (page, limit, searchQuery, paidStatus) => {
    const filter = {};
    if (searchQuery && searchQuery.trim() !== "") {
        filter.name = { $regex: new RegExp(searchQuery, "i") };
    }
    if (paidStatus !== undefined) {
        filter.paymentStatus = paidStatus
    }
    return new Promise(async (resolve, reject) => {
        try {
            const skip = (page - 1) * limit;
            const [schools, totalCount] = await Promise.all([
                School.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .select('_id name pricipalName paymentStatus lastPaymentDate numberOfStudents subscriptionAmount subscriptionStartDate subscriptionEndDate')
                    .sort({ createdAt: -1 })
                    .lean(),
                School.countDocuments(filter)
            ]);

            resolve({
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalSchools: totalCount,
                schools,
            });
        } catch (error) {
            reject(error);
        }
    });
}

const getAllowBoxSchool = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const school = await School.findById(id);
            if (!school) {
                return reject({
                    statusCode: 404,
                    message: "School Not found"
                });
            }
            resolve(school);
        } catch (error) {
            reject(error);
        }
    })
}

const createClass = (classData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newClass = new Class(classData);
            const created = await newClass.save();
            resolve(created);
        } catch (error) {
            reject(error);
        }
    })
}

const updateClass = (id, classData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const updated = await Class.findByIdAndUpdate(id, classData, { new: true });
            resolve(updated);
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    createSchool,
    getAllowBoxSchools,
    getAllowBoxSchool,
    createClass,
    updateClass
}