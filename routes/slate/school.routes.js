const { Router } = require("express");
const { default: httpStatus } = require('http-status');
const router = Router();
const config = require('../../config/config');

const { superAdminAuth } = require("../../middlewares/slate/superAdminAuth");

const {
    validateCreateSchool,
    validateUpdateSchool
} = require('../../middlewares/validations/slate/school.validations');

const allowBoxSchoolController = require("../../controllers/slate/School.controller");
const emailerService = require('../../services/mailsender.service')


//allowbox schools related routes
router.get("/allow-box-schools", superAdminAuth, async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    const paidStatus = req.query.paidStatus === "true"
        ? true : (req.query.paidStatus === "false" ? false : undefined);
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers."
        });
    }
    try {
        const result = await allowBoxSchoolController.getAllowBoxSchools(page, limit, search, paidStatus);
        if (result.totalSchools === 0) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "No schools found" });
        }
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.get("/allow-box-school/:schoolId", superAdminAuth, async (req, res, next) => {
    console.log(req.params);

    try {
        const result = await allowBoxSchoolController.getAllowBoxSchool(req.params.schoolId);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.get("/allow-box-school/trigger-pending-payment-email/:schoolId", superAdminAuth, async (req, res, next) => {
    try {
        const school = await allowBoxSchoolController.getAllowBoxSchool(req.params.schoolId);
        if (!school) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "School not found" });
        }
        await emailerService.triggerEmail("school-payment-reminder", school, "Payment Reminder");
        res.status(httpStatus.OK).json();
    } catch (error) {
        next(error);
    }
})

router.put("/allow-box-school/:schoolId", superAdminAuth, validateUpdateSchool, async (req, res, next) => {
    try {
        const result = await allowBoxSchoolController.updateAllowBoxSchool(req.params.schoolId, req.body);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.delete("/allow-box-school/:schoolId", superAdminAuth, async (req, res, next) => {
    try {
        await allowBoxSchoolController.deleteAllowBoxSchool(req.params.schoolId);
        res.status(httpStatus.OK).send();
    } catch (error) {
        next(error);
    }
}); 

module.exports = router;