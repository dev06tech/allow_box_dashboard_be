const Joi = require('joi');
const httpStatus = require('http-status');
const { assignRole } = require('../../../controllers/slate/SuperAdmin.controller');

// Registration schema
const registrationSchema = Joi.object({
    fullName: Joi.string().required().messages({'string.empty': 'Full name is required'}),
    email: Joi.string().email().required().messages({'string.empty': 'Email is required'}),
    password: Joi.string().min(6).required().messages({'string.empty': 'Password is required'}),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Confirm password is required'
    })
}).strict();

const emailVerificationSchema = Joi.object({
    email: Joi.string().email().required().messages({'string.empty': 'Email is required'}),
}).strict();

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({'string.empty': 'Email is required'}),
    password: Joi.string().min(6).required().messages({'string.empty': 'Password is required'}),
}).strict();

const updatePasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({'string.empty': 'Email is required'}),
    oldPassWord: Joi.string().min(8).messages({'string.empty': 'Old password is required'}),
    newPassword: Joi.string().min(8).required()
        .invalid(Joi.ref('oldPassWord'))
        .messages({
            'string.empty': 'New password is required',
            'any.invalid': 'New password must be different from old password'
        }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Confirm password is required'
    })
}).strict();

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({'string.empty': 'Email is required'}),
}).strict();

const newUserchema = Joi.object({
    fullName: Joi.string().required().messages({'string.empty': 'Full name is required'}),
    email: Joi.string().email().required().messages({'string.empty': 'Email is required'}),
    role: Joi.string().valid("super-admin", "teacher", "student", "parent", "support").required().messages({ 'string.empty': 'Admin role is required' }),
    associatedSchool: Joi.string().required().messages({ 'string.empty': 'School id is required' }),
}).strict();

module.exports = {
    registrationSchema,
    emailVerificationSchema,
    loginSchema,
    updatePasswordSchema,
    resetPasswordSchema,
    newUserchema
}