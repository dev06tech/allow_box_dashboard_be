const { Router } = require("express");
const { default: httpStatus } = require('http-status');
const router = Router();

const { userAuth } = require("../../middlewares/allow-box/userAuth");

const { validateClass } = require('../../middlewares/validations/allow-box/class.validations');

const allowBoxClassController = require("../../controllers/allow-box/Class.controller");

// allowbox classes related routes
router.post("/allow-box-class", userAuth, validateClass, async (req, res, next) => {    
    const allowedRoles = ["super-admin"]
    if (req.user.role && !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
    }
    try {
        const createdClass = await allowBoxClassController.createClass(req.body);
        res.status(httpStatus.CREATED).json(createdClass);
    } catch (error) {
        next(error);
    }
})

router.put("/allow-box-class/:classId", userAuth, validateClass, async (req, res, next) => {
    const allowedRoles = ["super-admin"]
    if (req.user.role && !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
    }
    try {
        const updatedClass = await allowBoxClassController.updateClass(req.params.classId, req.body);
        res.status(httpStatus.OK).json(updatedClass);
    } catch (error) {
        next(error);
    }
})

router.get("/allow-box-classes/:schoolId", userAuth, async (req, res, next) => {
    const allowedRoles = ["super-admin"]
    if (req.user.role && !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
    }

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers."
        });
    }
    try {
        const classes = await allowBoxClassController.getClassesBySchool(req.params.schoolId, page, limit, search);
        if (classes.totalClasses === 0) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "No classes found" });
        }
        res.status(httpStatus.OK).json(classes);
    } catch (error) {
        next(error);
    }
})

router.get("/allow-box-class/:classId", userAuth, async (req, res, next) => {
    const allowedRoles = ["super-admin"]
    if (req.user.role && !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
    }

    try {
        const result = await allowBoxClassController.getClass(req.params.classId);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
})

router.delete("/allow-box-class/:classId", userAuth, async (req, res, next) => {
    const allowedRoles = ["super-admin"]
    if (req.user.role && !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
    }   
    try {
        await allowBoxClassController.deleteClass(req.params.classId);
        res.status(httpStatus.OK).send();
    } catch (error) {
        next(error);
    }
})

module.exports = router;