const { Router } = require("express");
const { default: httpStatus } = require('http-status');
const router = Router();
const config = require('../../config/config');

const {validateRegistration, validateLogin} = require('../../middlewares/validations/user.validations');
const superAdminController = require("../../controllers/SuperAdmin.controller");
const { superAdminAuth } = require("../../middlewares/superAdminAuth");

router.post("/register", validateRegistration, async (req, res, next) => {
  const { fullName, email, password } = req.body;
  try { 
    const user = await superAdminController.createSuperAdmin( fullName, email, password );
    res.status(httpStatus.CREATED).json(user);
  }
  catch (error) {
    next(error)
  }
})

router.post("/login", validateLogin, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await superAdminController.login(email, password);
    res.status(httpStatus.OK).json({status:true, message: "Logged in successfully", user});
  } catch (error) {
    next(error)
  }
})

router.get("/logout",superAdminAuth, async (req, res, next) => {
  try {    
    await superAdminController.logout(req.superAdmin, req.token);
    res.status(httpStatus.OK).json({status:true, message: "Logged out successfully"});
  } catch (error) {
    next(error)
  }
})
module.exports = router;
