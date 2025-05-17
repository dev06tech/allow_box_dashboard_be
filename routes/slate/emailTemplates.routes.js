const { Router } = require("express");
const { default: httpStatus } = require('http-status');
const router = Router();
const config = require('../../config/config');

const {validateEmailTemplate} = require('../../middlewares/validations/slate/emailTemplate.validations')  
const {superAdminAuth} = require('../../middlewares/slate/superAdminAuth')

const emailTemplateController = require("../../models/slate/emailTempate.model");

router.post("/create", validateEmailTemplate, superAdminAuth,async (req, res, next) => {
    const { type, emailContent, emailSubject } = req.body;
    try {
        const emailTemplate = await emailTemplateController.create({ type, emailContent, emailSubject });
        res.status(httpStatus.CREATED).json(emailTemplate);
    } catch (error) {
        next(error)
    }
})

module.exports = router;