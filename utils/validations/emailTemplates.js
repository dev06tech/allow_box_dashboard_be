const Joi = require('joi');

const emailTemplateSchema = Joi.object({
    name: Joi.string().required().messages({'string.empty': 'Name is required'}),
    subject: Joi.string().required().messages({'string.empty': 'Subject is required'}),
    body: Joi.string().required().messages({'string.empty': 'Body is required'}),
}).strict();

module.exports = {
    emailTemplateSchema,
}