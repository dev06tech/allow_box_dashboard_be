const {
    emailTemplateSchema
} = require('../../utils/validations/emailTemplates');

const validateEmailTemplate = (req, res, next) => {
    const { error } = emailTemplateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

module.exports = {
    validateEmailTemplate
}