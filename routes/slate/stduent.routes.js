const { Router } = require("express");
const { default: httpStatus } = require('http-status');
const router = Router();

const { superAdminAuth } = require("../../middlewares/slate/superAdminAuth");

const { validatestudentDetails } = require('../../middlewares/validations/slate/stduentDetails.validations');

const StudentDetailsController  = require("../../controllers/slate/StudentDetails.controller");


router.post("/add-student-details", superAdminAuth, validatestudentDetails, async (req, res, next) => {
    try {
        const result = await StudentDetailsController.createStudentDetails(req.body);
        res.status(httpStatus.CREATED).json(result);
    } catch (error) {
        next(error);
    }
})

router.put("/update-student-details", superAdminAuth, validatestudentDetails, async (req, res, next) => {
    try {
        const result = await StudentDetailsController.updateStudentDetails(req.body);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
})

router.get("/get-student-details/:studentId", superAdminAuth, async (req, res, next) => {
    try {
        const result = await StudentDetailsController.getStudentDetails(req.params.studentId);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
})

router.delete("/delete-student-details/:studentId", superAdminAuth, async (req, res, next) => {
    try {
        const result = await StudentDetailsController.deleteStudentDetails(req.params.studentId);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
})

module.exports = router