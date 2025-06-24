const Joi = require('joi');

const mongoose = require('mongoose');

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const baseSchoolSchema = {
  name: Joi.string().trim(),
  email: Joi.string().email().trim().lowercase(),
  principalName: Joi.string().trim(),
  schoolOwnerName: Joi.string().trim(),
  phone: Joi.string().trim().pattern(/^[0-9]{10,15}$/), 
  address: Joi.string().trim(),
  createdBy: Joi.string().custom(objectIdValidator),
  isSchoolProfileCompleted: Joi.boolean(),
  paymentStatus: Joi.boolean(),
  numberOfStudents: Joi.number().integer().min(0),
  subscriptionAmount: Joi.number().positive().allow(null),
  subscriptionStartDate: Joi.date().allow(null),
  subscriptionEndDate: Joi.date().allow(null),
  isActive: Joi.boolean()
};

const createSchool = Joi.object({
  ...baseSchoolSchema,
  name: baseSchoolSchema.name.required(),
  email: baseSchoolSchema.email.required(),
  principalName: baseSchoolSchema.principalName.required(),
  schoolOwnerName: baseSchoolSchema.schoolOwnerName.required(),
  phone: baseSchoolSchema.phone.required(),
  address: baseSchoolSchema.address.required(),
  createdBy: baseSchoolSchema.createdBy.required()
});

const updateSchool = Joi.object(baseSchoolSchema);


module.exports = {
  createSchool,
  updateSchool
};