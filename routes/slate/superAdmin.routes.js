const { Router } = require("express");
const { default: httpStatus } = require('http-status');
const router = Router();
const config = require('../../config/config');

const { validateSchoolRegistration, validateRegistration, validateLogin } = require('../../middlewares/validations/slate/user.validations');

const { superAdminAuth } = require("../../middlewares/slate/superAdminAuth");

const slateSuperAdminController = require("../../controllers/slate/SuperAdmin.controller");
const allowBoxSchoolController = require("../../controllers/slate/School.controller");
const slateUserController = require("../../controllers/slate/User.controller");


router.post("/register", validateRegistration, async (req, res, next) => {
    const { fullName, email, password } = req.body;
    try {
        const user = await slateSuperAdminController.createSuperAdmin(fullName, email, password);
        res.status(httpStatus.CREATED).json(user);
    }
    catch (error) {
        next(error)
    }
})

router.post("/register-school-user", validateSchoolRegistration, superAdminAuth, async (req, res, next) => {
    const { schoolData, userData } = req.body;
    schoolData.createdBy = req.superAdmin._id;
    try {
        const createdSchool = await allowBoxSchoolController.createAllowBoxSchool(schoolData);
        userData.associatedSchool = createdSchool._id;
        const createdUser = await slateUserController.createSchoolSuperAdmin(userData);
        res.status(httpStatus.CREATED).json({
            user: createdUser,
            school: createdSchool
        });
    }
    catch (error) {
        next(error)
    }
})

router.post("/login", validateLogin, async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await slateSuperAdminController.login(email, password);
        res.status(httpStatus.OK).json(user);
    } catch (error) {
        next(error)
    }
})

router.get("/logout", superAdminAuth, async (req, res, next) => {
    try {
        await slateSuperAdminController.logout(req.superAdmin, req.token);
        res.status(httpStatus.OK).json({ status: true, message: "Logged out successfully" });
    } catch (error) {
        next(error)
    }
})

router.put("/assign-role", superAdminAuth, async (req, res, next) => {
    try {
        const user = await slateSuperAdminController.assignRole(req.body);
        res.status(httpStatus.OK).json(user);
    } catch (error) {
        next(error)
    }
})
module.exports = router;
