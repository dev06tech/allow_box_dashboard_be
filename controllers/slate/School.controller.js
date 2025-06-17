
const School = require('../../models/allow-box/school.model');

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

const getAllowBoxSchools = (page, limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            const skip = (page - 1) * limit;
            const [schools, totalCount] = await Promise.all([
                School.find()
                    .skip(skip)
                    .limit(limit)
                    .select('_id name pricipalName paymentStatus lastPaymentDate numberOfStudents subscriptionAmount subscriptionStartDate subscriptionEndDate')
                    .sort({ createdAt: -1 })
                    .lean(),
                School.countDocuments()  // You had User.countDocuments() mistakenly here
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


module.exports = {
    createSchool,
    getAllowBoxSchools,
    getAllowBoxSchool
}