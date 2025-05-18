
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

module.exports = {
    createSchool
}