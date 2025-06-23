const { default: httpStatus } = require('http-status');

const Class = require('../../models/allow-box/class.model');

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

const getClassesBySchool = (schoolId, page, limit, search) => {
    let filter = {
        associatedSchool: schoolId
    };
    if (search && search.trim() !== "") {
        filter.name = { $regex: new RegExp(search, "i") };
    }   
    return new Promise(async (resolve, reject) => {
        try {
            const skip = (page - 1) * limit;
            const [classes, totalCount] = await Promise.all([
                Class.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Class.countDocuments(filter)
            ]);
            resolve({
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalClasses: totalCount,
                classes
            });
        } catch (error) {
            reject(error);
        }
    })
}

const getClass = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const classData = await Class.findById(id);
            if (!classData) {
                return reject({ statusCode: httpStatus.NOT_FOUND, message: "Class not found" });
            }
            resolve(classData);
        } catch (error) {
            reject(error);
        }
    })
}

const deleteClass = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const deletedClass = await Class.findByIdAndDelete(id);
            if (!deletedClass) {
                return reject({ statusCode: httpStatus.NOT_FOUND, message: "Class not found" });
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = { 
    createClass, 
    updateClass, 
    getClassesBySchool, 
    getClass,
    deleteClass 
}