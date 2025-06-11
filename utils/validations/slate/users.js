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
        numberOfStudents: Joi.number().required().messages({ 'string.empty': 'Number of students is required' }),
        principalName: Joi.string().required().messages({ 'string.empty': 'Principal name is required' }),
        schoolOwnerName: Joi.string().required().messages({ 'string.empty': 'School owner name is required' }),
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

const userRoleSchema = Joi.object({
  ids: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required()
    .messages({
      'array.base': `"ids" must be an array of MongoDB ObjectIds`,
      'array.min': `"ids" must contain at least one ID`,
      'string.pattern.base': `"ids" must be valid 24-character MongoDB ObjectIds`
    }),

  role: Joi.string()
    .valid("super-admin", "teacher", "student", "parent", "staff", "support")
    .required()
    .messages({
      'any.only': `"role" must be one of ['super-admin', 'admin', 'teacher', 'staff', 'student']`
    })
});

module.exports = {
    registrationSchema,
    schoolRegistrationSchema,
    loginSchema,
    userUpdateSchema,
    validateUserSchema,
    userRoleSchema
}