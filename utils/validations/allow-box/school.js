const Joi = require("joi");

const allowBoxSchoolSchema = Joi.object({
    name: Joi.string().trim().optional(),
    email: Joi.string().email().trim().lowercase().optional(),
    principalName: Joi.string().trim().optional(),
    schoolOwnerName: Joi.string().trim().optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    address: Joi.string().optional(),
    numberOfStudents: Joi.number().integer().min(0).optional(),

    // Prevent updates to payment-related fields
    createdBy: Joi.forbidden(),
    isSchoolProfileCompleted: Joi.forbidden(),
    isActive: Joi.forbidden(),
    paymentStatus: Joi.forbidden(),
    subscriptionAmount: Joi.forbidden(),
    subscriptionStartDate: Joi.forbidden(),
    subscriptionEndDate: Joi.forbidden(),
});


module.exports = {
    allowBoxSchoolSchema,
};