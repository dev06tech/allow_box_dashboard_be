const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const studentDetailsSchema = Joi.object({
  studentId: Joi.string().custom(objectId),
  currentClass: Joi.string().custom(objectId),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid("Male", "Female", "Other").optional(),
  rollNumber: Joi.number().optional(),
  parentName: Joi.string().optional(),
  parentPhone: Joi.string().optional(),
  parentId: Joi.string().custom(objectId).optional(),
  address: Joi.string().optional(),
  photoUrl: Joi.string().uri().optional(),

  academics: Joi.array().items(
    Joi.object({
      academicYear: Joi.string().optional(),
      classId: Joi.string().custom(objectId).optional(),
      promotedToNext: Joi.boolean().optional(),
      marks: Joi.array().items(
        Joi.object({
          subject: Joi.string().optional(),
          nameOfExam: Joi.string().optional(),
          obtainedMarks: Joi.number().optional(),
          totalMarks: Joi.number().optional(),
          examDate: Joi.date().optional(),
          isPassed: Joi.boolean().optional(),
        })
      ).optional()
    })
  ).optional()
});

module.exports = { studentDetailsSchema };
