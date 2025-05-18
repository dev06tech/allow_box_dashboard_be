const { Router } = require("express");
const { default: httpStatus } = require('http-status');
const router = Router();
const config = require('../../config/config');
const {
  createConnection,
  getConnectionUrl
} = require('../../services/google.service');

const {
  validateRegistration,
  validateEmailVerification,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateNewUser
} = require('../../middlewares/validations/allow-box/user.validations');


const {
  userAuth,
  isRegisteredUser
} = require("../../middlewares/allow-box/userAuth");

const { superAdminAuth } = require("../../middlewares/allow-box/superAdminAuth");

const userController = require("../../controllers/allow-box/User.controller");

router.post("/register", validateRegistration, async (req, res, next) => {
  const { fullName, email, password } = req.body;
  try {
    const user = await userController.createUser({ fullName, email, password });
    res.status(httpStatus.CREATED).json(user);
  } catch (error) {
    next(error)
  }
})

router.post("/verify-email", validateEmailVerification, isRegisteredUser, async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Please Provide Email"
    });
  }
  try {
    const user = await userController.verifyEmail(email);
    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error)
  }
})

router.post("/resend-verification-email", validateEmailVerification, async (req, res, next) => {
  const { email } = req.body;  
  try {
    await userController.resendVerificationEmail(email);
    res.status(httpStatus.OK).send()
  } catch (error) {
    next(error)
  }
})

router.post("/login", validateLogin, async (req, res, next) => {
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

router.get("/get-auth-url", (req, res, next) => {
  try {
    const auth = createConnection();
    const connectonURL = getConnectionUrl(auth);
    res.send(connectonURL);
  } catch (error) {
    next(error)
  }
})

//Gets the user data
//Need to pass 'code' value from the Url to get the profile payload

router.post("/get-profile", async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return res.status(httpStatus.BAD_REQUEST).send("Auth Code is required")
  }
  try {
    const verified = await userController.processGoogleAuth(code)
    res.status(httpStatus.OK).send(verified)


  } catch (error) {
    next(error)
  }

});

router.post("/logout", userAuth, async (req, res, next) => {
  try {
    await userController.logout(req.user, req.token);
    res.status(httpStatus.OK).json({ status: true, message: "Logged out successfully" });
  } catch (error) {
    next(error)
  }
})

router.put("/change-password", validateChangePassword, async (req, res, next) => {
  const { email, oldPassWord, newPassword } = req.body;
  try {
    const user = await userController.changePassword(email, oldPassWord, newPassword);
    res.status(httpStatus.OK).json(user);
  }
  catch (error) {
    next(error)
  }
})

router.put("/forgot-password", validateForgotPassword, async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await userController.forgotPassword(email);
    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error)
  }
})

router.post("/add-new-user", validateNewUser, superAdminAuth, async (req, res, next) => {
  const userData = req.body;
  try {
    const user = await userController.createUser(userData);
    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error)
  }
})

module.exports = router;