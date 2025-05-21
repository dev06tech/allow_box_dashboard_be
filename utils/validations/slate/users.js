const Joi = require('joi');
const httpStatus = require('http-status');
const { default: isEmail } = require('validator/lib/isEmail');

// Registration schema
const schoolRegistrationSchema = Joi.object({
    schoolData: Joi.object({
        name: Joi.string().required().messages({ 'string.empty': 'School name is required' }),
        email: Joi.string().email().required().messages({ 'string.empty': 'School email is required', 'string.email': 'School email must be valid' }),
        phone: Joi.string().required().messages({ 'string.empty': 'Phone number is required' }),
        address: Joi.string().required().messages({ 'string.empty': 'Address is required' }),
    }).required(),
    userData: Joi.object({
        email: Joi.string().email().required().messages({ 'string.empty': 'Admin email is required', 'string.email': 'Admin email must be valid' }),
        fullName: Joi.string().required().messages({ 'string.empty': 'Admin full name is required' }),
        role: Joi.string().valid("super-admin", "teacher", "student", "parent", "support").required().messages({ 'string.empty': 'Admin role is required' }),
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

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({ 'string.empty': 'Email is required' }),
    password: Joi.string().min(6).required().messages({ 'string.empty': 'Password is required' }),
}).strict();

const userUpdateSchema = Joi.object({
    _id: Joi.string().required().messages({ 'string.empty': 'User id is required' }),
    fullName: Joi.string().optional().messages({ 'string.empty': 'Full name is required' }),
    email: Joi.string().email().optional().messages({ 'string.empty': 'Email is required' }),
    password: Joi.string().min(6).optional().messages({ 'string.empty': 'Password is required' }),
    role: Joi.string().valid("super-admin", "teacher", "student", "parent", "support").optional().messages({ 'string.empty': 'Admin role is required' }),
    isBlocked: Joi.boolean().optional().messages({ 'string.empty': 'isBlocked is required' }),
    isEmailVerified: Joi.boolean().optional().messages({ 'string.empty': 'isEmailVerified is required' }),
    isLoggedIn: Joi.boolean().optional().messages({ 'string.empty': 'isLoggedIn is required' }),
    registeredVia: Joi.string().optional().messages({ 'string.empty': 'isRegisteredVia is required' }),
    associatedSchool: Joi.string().optional().messages({ 'string.empty': 'School id is required' })
})

const validateUserSchema = Joi.object({
    userId: Joi.string().required().messages({ 'string.empty': 'User id is required' })
})
module.exports = {
    registrationSchema,
    schoolRegistrationSchema,
    loginSchema,
    userUpdateSchema,
    validateUserSchema
}