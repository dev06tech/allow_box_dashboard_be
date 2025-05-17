
const School = require('../../models/allow-box/school.model');

const createAllowBoxSchool = (schoolData, adminId) => {
    let schoolSuperAdmins = [];
    schoolSuperAdmins.push(adminId);
    schoolData.schoolSuperAdmins = schoolSuperAdmins;
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

module.exports = {
    createAllowBoxSchool
}