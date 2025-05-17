const Joi = require('joi');
const httpStatus = require('http-status');

// Registration schema
const schoolRegistrationSchema = Joi.object({
    schoolData: Joi.object({
        name: Joi.string().required().messages({ 'string.empty': 'School name is required' }),
        email: Joi.string().email().required().messages({ 'string.empty': 'School email is required', 'string.email': 'School email must be valid' }),
        phone: Joi.string().required().messages({ 'string.empty': 'Phone number is required' }),
        address: Joi.string().required().messages({ 'string.empty': 'Address is required' }),
    }).required(),
    adminData: Joi.object({
        email: Joi.string().email().required().messages({ 'string.empty': 'Admin email is required', 'string.email': 'Admin email must be valid' }),
        fullName: Joi.string().required().messages({ 'string.empty': 'Admin full name is required' }),
    }).required()
}).strict();

const registrationSchema = Joi.object({
    fullName: Joi.string().required().messages({ 'string.empty': 'Full name is required' }),
    email: Joi.string().email().required().messages({ 'string.empty': 'Email is required' }),
    password: Joi.string().min(6).required().messages({ 'string.empty': 'Password is required' }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Confirm password is required'
    })
}).strict();

const emailVerificationSchema = Joi.object({
    email: Joi.string().email().required().messages({ 'string.empty': 'Email is required' }),
    otp: Joi.string().required().max(6).messages({ 'string.empty': 'OTP is required' }),
}).strict();

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({ 'string.empty': 'Email is required' }),
    password: Joi.string().min(6).required().messages({ 'string.empty': 'Password is required' }),
}).strict();

const updatePasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({ 'string.empty': 'Email is required' }),
    oldPassWord: Joi.string().min(8).required().messages({ 'string.empty': 'Old password is required' }),
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

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({ 'string.empty': 'Email is required' }),
}).strict();

module.exports = {
    registrationSchema,
    schoolRegistrationSchema,
    emailVerificationSchema,
    loginSchema,
    updatePasswordSchema,
    forgotPasswordSchema
}