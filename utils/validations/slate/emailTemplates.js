const Joi = require('joi');

const emailTemplateSchema = Joi.object({
    type: Joi.string().required().messages({'string.empty': 'Name is required'}),
    email: Joi.string().required().messages({'string.empty': 'Subject is required'}),
    emailContent: Joi.string().required().messages({'string.empty': 'Body is required'}),
    emailSubject: Joi.string().required().messages({'string.empty': 'Body is required'}),
}).strict();

module.exports = {
    emailTemplateSchema,
}