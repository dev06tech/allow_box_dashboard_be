const { Router } = require("express");
const { default: httpStatus } = require('http-status');
const router = Router();
const config = require('../../config/config');

const {userAuth} = require('../../middlewares/allow-box/userAuth');

const {
    validateSchool
} = require('../../middlewares/validations/allow-box/school.validations');

const allowBoxSchoolController = require("../../controllers/allow-box/School.controller");


router.get("/allow-box-school", userAuth, async (req, res, next) => {
    try {
        const result = await allowBoxSchoolController.getSchoolById(req.user.associatedSchool);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
})

router.put("/allow-box-school", userAuth, validateSchool, async (req, res, next) => {
    try {
        const result = await allowBoxSchoolController.updateSchool(req.user.associatedSchool, req.body);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;