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
  validateResetPassword,
  validateNewUser,
  validateUserUpdate,
  validateUserId
} = require('../../middlewares/validations/allow-box/user.validations');

const {
  userAuth,
  isRegisteredUser,
  resetPasswordAuth
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

router.post("/verify-email", isRegisteredUser, async (req, res, next) => {
  const requestedUser = req.user;
  try {
    const user = await userController.verifyEmail(requestedUser);
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

router.put("/change-password", userAuth, validateChangePassword, async (req, res, next) => {
  const { newPassword } = req.body;
  const requestedUser = req.user;
  try {
    await userController.changePassword(newPassword, requestedUser);
    res.status(httpStatus.OK).send();
  }
  catch (error) {
    next(error)
  }
})

router.put("/reset-password-email", validateResetPassword, async (req, res, next) => {
  const { email } = req.body;
  try {
    await userController.resetPassword(email);
    res.status(httpStatus.OK).send();
  } catch (error) {
    next(error)
  }
})

router.put("/reset-password", resetPasswordAuth, validateChangePassword, async (req, res, next) => {
  const { newPassword } = req.body;
  const requestedUser = req.user;
  try {
    await userController.changePassword(newPassword, requestedUser);
    res.status(httpStatus.OK).send();
  } catch (error) {
    next(error)
  }
})

router.post("/super-admin/add-new-user", validateNewUser, superAdminAuth, async (req, res, next) => {
  const userData = req.body;
  userData.registeredVia = "allow-box";
  try {
    const user = await userController.createUser(userData);
    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error)
  }
})

router.put("/super-admin/update-user", validateUserUpdate, superAdminAuth, async (req, res, next) => {
    try {
        const user = await userController.updateAllowBoxUser(req.body);
        res.status(httpStatus.OK).json(user);
    } catch (error) {
        next(error)
    }
})

router.delete("/super-admin/delete-user", validateUserId, superAdminAuth, async (req, res, next) => {
    try {
        await userController.deleteAllowBoxUser(req.body);
        res.status(httpStatus.OK).send();
    } catch (error) {
        next(error)
    }
})

router.get("/get-users", userAuth, async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    const allowedRoles = ["super-admin", "teacher", "support", "staff"];
    const requesterRole = req.user.role;
    
    if(req.user.role && !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).send({message: "Access Denied"})
    }
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers."
        });
    }
    try {
        const result = await userController.getAllowBoxUsers(page, limit, search, requesterRole);        
        if (result.totalUsers === 0) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "No users found" });
        }
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.get("/get-user/:userId", userAuth, async (req, res, next) => {
  const allowedRoles = ["super-admin", "teacher", "support", "staff"];
    const requesterRole = req.user.role;
    if(req.user.role && !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).send({message: "Access Denied"})
    }
    try {
        const result = await userController.getAllowBoxUser(req.params.userId, requesterRole);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/mark-attendance", userAuth, async (req, res, next) => {
    try {
        const attendance = await userController.markAttendance(req.user);
        res.status(httpStatus.OK).json(attendance);
    } catch (error) {
        next(error)
    }
})

module.exports = router;