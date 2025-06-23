const { Router } = require("express");
const { default: httpStatus } = require('http-status');
const router = Router();
const config = require('../../config/config');

const { validateSchoolRegistration,
    validateRegistration,
    validateLogin,
    validateUserUpdate,
    validateUserId,
    validateUserRoleData
} = require('../../middlewares/validations/slate/user.validations');

const { validateClass } = require('../../middlewares/validations/allow-box/class.validations');

const { superAdminAuth } = require("../../middlewares/slate/superAdminAuth");

const slateSuperAdminController = require("../../controllers/slate/SuperAdmin.controller");
const allowBoxSchoolController = require("../../controllers/slate/School.controller");
const slateUserController = require("../../controllers/slate/User.controller");
const emailerService = require('../../services/mailsender.service')


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
        const createdSchool = await allowBoxSchoolController.createSchool(schoolData);
        userData.associatedSchool = createdSchool._id;
        const createdUser = await slateUserController.createAllowBoxUser(userData);
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

router.get("/dashboard", superAdminAuth, async (req, res, next) => {
    try {
        const dashboardData = await slateSuperAdminController.getDashboardData();
        res.status(httpStatus.OK).json(dashboardData);
    } catch (error) {
        next(error)
    }
})

//alllowbox users related routes
router.post("/allow-box-user", superAdminAuth, async (req, res, next) => {
    const userData = req.body;
    try {
        const createdUser = await slateUserController.createAllowBoxUser(userData);
        res.status(httpStatus.CREATED).json(createdUser);
    } catch (error) {
        next(error);
    }
})

router.get("/allow-box-users", superAdminAuth, async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers."
        });
    }
    try {
        const result = await slateUserController.getAllowBoxUsers(page, limit, search);
        if (result.totalUsers === 0) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "No users found" });
        }
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.get("/allow-box-user/:userId", superAdminAuth, async (req, res, next) => {
    try {
        const result = await slateUserController.getAllowBoxUser(req.params.userId);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.put("/allow-box-users/assign-role", validateUserRoleData, superAdminAuth, async (req, res, next) => {
    try {
        const user = await slateSuperAdminController.assignRole(req.body);
        res.status(httpStatus.OK).json(user);
    } catch (error) {
        next(error)
    }
})

router.put("/allow-box-users/update", validateUserUpdate, superAdminAuth, async (req, res, next) => {
    try {
        const user = await slateUserController.updateAllowBoxUser(req.body);
        res.status(httpStatus.OK).json(user);
    } catch (error) {
        next(error)
    }
})

router.delete("/allow-box-users/delete", validateUserId, superAdminAuth, async (req, res, next) => {
    try {
        await slateUserController.deleteAllowBoxUser(req.body);
        res.status(httpStatus.OK).send();
    } catch (error) {
        next(error)
    }
})

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

// allowbox classes related routes
router.post("/allow-box-class", superAdminAuth, validateClass, async (req, res, next) => {
    try {
        const createdClass = await allowBoxSchoolController.createClass(req.body);
        res.status(httpStatus.CREATED).json(createdClass);
    } catch (error) {
        next(error);
    }
})

router.put("/allow-box-class/:classId", superAdminAuth, validateClass, async (req, res, next) => {
    try {
        const updatedClass = await allowBoxSchoolController.updateClass(req.params.classId, req.body);
        res.status(httpStatus.OK).json(updatedClass);
    } catch (error) {
        next(error);
    }
})

router.get("/allow-box-classes/:schoolId", superAdminAuth, async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers."
        });
    }
    try {
        const classes = await allowBoxSchoolController.getClassesBySchool(req.params.schoolId, page, limit, search);
        console.log(classes);
        
        if (classes.totalClasses === 0) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "No classes found" });
        }
        res.status(httpStatus.OK).json(classes);
    } catch (error) {
        next(error);
    }
})

router.delete("/allow-box-class/:classId", superAdminAuth, async (req, res, next) => {
    try {
        await allowBoxSchoolController.deleteClass(req.params.classId);
        res.status(httpStatus.OK).send();
    } catch (error) {
        next(error);
    }
})
module.exports = router;
