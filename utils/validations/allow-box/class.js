const Joi = require('joi');
const mongoose = require('mongoose');

const classSchema = Joi.object({
    name: Joi.string()
        .pattern(/^[IVXLCDM]+$/) 
        .optional()
        .messages({
            "string.pattern.base": "Class name must be in Roman numerals (e.g., I, II, III, IV...)",
            "string.uppercase": "Class name must be in uppercase",
        }),
    division: Joi.string()
        .pattern(/^[A-Z]+$/)
        .optional()
        .messages({
            "string.pattern.base": "Division must contain only uppercase letters (A-Z)",
            "string.uppercase": "Division must be in uppercase",
        }),
    classTeacher: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        })
        .optional(),
    associatedSchool: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        })
        .optional(),
    students: Joi.array()
        .items(
            Joi.string().custom((value, helpers) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.error("any.invalid");
                }
                return value;
            })
        )
        .default([]),
    subjects: Joi.array()
        .items(
            Joi.string().custom((value, helpers) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.error("any.invalid");
                }
                return value;
            })
        )
        .default([]),
    yearlyCLassFees: Joi.number().positive().required(),
});

module.exports = {
    classSchema
}