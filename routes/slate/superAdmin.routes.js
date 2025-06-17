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
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers."
        });
    }
    try {
        const result = await allowBoxSchoolController.getAllowBoxSchools(page, limit, search);
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

module.exports = router;
