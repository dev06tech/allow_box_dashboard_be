const { Router } = require("express");
const {default:httpStatus} = require('http-status');
const router = Router();

const userAuth = require("../middlewares/userAuth");

const userController = require("../controllers/User.controller");

router.post("/register", async (req, res, next) => {
    const { fullName, email, password, selectedRole } = req.body;
    const missingFields = [];
    if (!fullName) missingFields.push('fullName');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (missingFields.length > 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }
    try {
        const user = await userController.createUser({ fullName, email, password, selectedRole });
        res.status(httpStatus.CREATED).json(user);
    } catch (error) {
        next(error)
    }
})

router.post("/verify-email", async (req, res, next) => {
    const { email, otp } = req.body;
    if (!otp) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Please Provide OTP"
        });
    }
    if (!email) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Please Provide Email"
        });
    }
    try {
        const user = await userController.verifyEmailAndOtp(email, otp);
        res.status(httpStatus.OK).json(user);
    } catch (error) {
        next(error)
    }
})

router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    if (!email) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Please Provide Email"
        });
    }
    if (!password) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Please Provide Password"
        });
    }
    try {
        const user = await userController.login(email, password);
        res.status(httpStatus.OK).json(user);
    } catch (error) {
        next(error)
    }
})

router.post("/logout", userAuth, async (req, res, next) => {
    try {
        const user = await userController.logout(req.user, req.token);
        res.status(httpStatus.OK).json(user);
    } catch (error) {
        next(error)
    }
})

module.exports = router;