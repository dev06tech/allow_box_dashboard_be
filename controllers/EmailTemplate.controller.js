const EmailTemplate = require("../models/emailTempate.model");
const { default: httpStatus } = require("http-status");

const create = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const emailTemplate = new EmailTemplate(data);
            await emailTemplate.save();
            resolve(emailTemplate);
        }
        catch (error) {
            reject(error);
        }
    })
}

const getEmailTemplate = async (type) => {
    return new Promise(async (resolve, reject) => {
        try {
            const emailTemplate = await EmailTemplate.findOne({ type });
            resolve(emailTemplate);
        }
        catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    create,
    getEmailTemplate
}    
