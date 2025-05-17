const School = require("../../models/allow-box/school.model");
const { default: httpStatus } = require("http-status")

const getSchoolById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const school = await School.findById(id);
            if (!school) {
                return reject({
                    statusCode: httpStatus.NOT_FOUND,
                    message: "School Not found"
                });
            }
            resolve(school);
        } catch (error) {
            reject(error);
        }
    })
}

const getSchoolByIdAndAddSuperAdmin = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const school = await School.findByIdAndUpdate(id,
                {
                    $addToSet: {
                        schoolAdmins: data
                    }
                },
                { new: true });
            if (!school) {
                return reject({
                    statusCode: httpStatus.NOT_FOUND,
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
    getSchoolById,
    getSchoolByIdAndAddSuperAdmin
}