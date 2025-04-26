const Joi = require('joi');
const httpStatus = require('http-status');

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
    otp: Joi.string().required().max(6).messages({'string.empty': 'OTP is required'}),
}).strict();

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({'string.empty': 'Email is required'}),
    password: Joi.string().min(6).required().messages({'string.empty': 'Password is required'}),
}).strict();

module.exports = {
    registrationSchema,
    emailVerificationSchema,
    loginSchema
}