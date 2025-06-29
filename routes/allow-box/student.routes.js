const { Router } = require("express");
const { default: httpStatus } = require('http-status');
const router = Router();

const { userAuth } = require("../../middlewares/allow-box/userAuth");

const { validatestudentDetails } = require('../../middlewares/validations/allow-box/studentDetails.validations');

const allowBoxStudentDetailsController  = require("../../controllers/allow-box/StudentDetails.controller");


router.post("/add-student-details", userAuth, validatestudentDetails, async (req, res, next) => {
    const allowedRoles = ["super-admin"]
    if (req.user.role && !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
    }
    try {
        const result = await allowBoxStudentDetailsController.createStudentDetails(req.user, req.body);
        res.status(httpStatus.CREATED).json(result);
    } catch (error) {
        next(error);
    }
})

router.put("/update-student-details", userAuth, validatestudentDetails, async (req, res, next) => {
    const allowedRoles = ["super-admin"]
    console.log(req.user);
    
    if (req.user.role && !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
    }
    try {
        const result = await allowBoxStudentDetailsController.updateStudentDetails(req.user, req.body);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
})

router.delete("/delete-student-details/:studentId", userAuth, async (req, res, next) => {
    const allowedRoles = ["super-admin"]
    if (req.user.role && !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
    }
    try {
        const result = await allowBoxStudentDetailsController.deleteStudentDetails(req.user, req.params.studentId);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
})

module.exports = router