const Joi = require('joi');
const mongoose = require('mongoose');

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('"{{#label}}" must be a valid ObjectId');
  }
  return value;
};

const studentsAttendanceSchema = Joi.object({
  attendance: Joi.array().items(
    Joi.object({
      studentId: Joi.string().custom(objectId).required(),
      isPresent: Joi.boolean().required()
    })
  ).min(1).required()
});

module.exports = {
  studentsAttendanceSchema
};
