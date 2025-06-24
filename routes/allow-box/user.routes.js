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
  const { fullName, email, password, phoneNumber } = req.body;
  try {
    const user = await userController.createUser({ fullName, email, password, phoneNumber });
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

router.post("/add-new-user", validateNewUser, superAdminAuth, async (req, res, next) => {
  const userData = req.body;
  userData.registeredVia = "allow-box";
  try {
    const user = await userController.createUser(userData);
    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error)
  }
})

router.put("/update-user", validateUserUpdate, superAdminAuth, async (req, res, next) => {
  try {
    const user = await userController.updateAllowBoxUser(req.body);
    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error)
  }
})

router.delete("/delete-user", validateUserId, superAdminAuth, async (req, res, next) => {
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
  const requesterSchoolId = req.user.associatedSchool;
  if (req.user.role && !allowedRoles.includes(req.user.role)) {
    return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
  }
  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers."
    });
  }
  try {
    const result = await userController.getAllowBoxUsers(page, limit, search, requesterRole, requesterSchoolId);
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
  const requesterSchoolId = req.user.associatedSchool;
  if (req.user.role && !allowedRoles.includes(req.user.role)) {
    return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
  }
  try {
    const result = await userController.getAllowBoxUser(req.params.userId, requesterRole, requesterSchoolId);
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/mark-attendance", userAuth, async (req, res, next) => {
  try {
    const allowedRoles = ["super-admin", "teacher", "support", "staff"]
    if (req.user.role && !allowedRoles.includes(req.user.role)) {
      return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
    }
    const attendance = await userController.markAttendance(req.user);
    res.status(httpStatus.OK).json(attendance);
  } catch (error) {
    next(error)
  }
})

//this is a static api, need to make it dynamic
router.get("/dashboard", userAuth, async (req, res, next) => {
  const allowedRoles = ["super-admin", /**"teacher", "support", "staff"*/];
  if (req.user.role && !allowedRoles.includes(req.user.role)) {
    return res.status(httpStatus.FORBIDDEN).send({ message: "Access Denied" })
  }

  const mockDashboardData = {
    "summary": {
      "studentAttendance": {
        "percentage": 93.6,
        "change": "+1.2%",
        "status": "increased"
      },
      "teacherAttendance": {
        "percentage": 97.2,
        "status": "100% on time"
      },
      "totalStudents": {
        "count": 5,
        "classes": 20,
        "newToday": 4
      },
      "feeCollection": {
        "percentage": 87.5,
        "pendingAmount": 15420
      }
    },
    "tabs": {
      "weeklyAttendance": {
        "days": [
          { "day": "Mon", "percentage": 85 },
          { "day": "Tue", "percentage": 90 },
          { "day": "Wed", "percentage": 95 },
          { "day": "Thu", "percentage": 92 },
          { "day": "Fri", "percentage": 87 },
          { "day": "Sat", "percentage": 0 },
          { "day": "Sun", "percentage": 0 }
        ]
      },
      // "events": [
      //   {
      //     "title": "Science Exhibition",
      //     "time": "10:00 AM - 12:30 PM",
      //     "date": "2025-04-17",
      //     "target": "Classes 7-9"
      //   },
      //   {
      //     "title": "Staff Meeting",
      //     "time": "3:30 PM - 4:30 PM",
      //     "date": "2025-04-17",
      //     "target": "All Teachers"
      //   },
      //   {
      //     "title": "Fee Deadline",
      //     "time": "",
      //     "date": "2025-04-17",
      //     "target": "All Students"
      //   }
      // ],
      // "quickActions": [
      //   { "label": "Add Student", "action": "add_student" },
      //   { "label": "Assign Homework", "action": "assign_homework" },
      //   { "label": "Take Attendance", "action": "take_attendance" },
      //   { "label": "Send Notice", "action": "send_notice" }
      // ],
      // "recentAlerts": [
      //   {
      //     "type": "Low Attendance",
      //     "message": "Class 8B has 72% attendance today",
      //     "time": "1 hour ago",
      //     "severity": "high"
      //   },
      //   {
      //     "type": "Fee Reminder",
      //     "message": "22 students haven’t paid April fees",
      //     "time": "Today",
      //     "severity": "medium"
      //   },
      //   {
      //     "type": "Assignment Complete",
      //     "message": "All students in Class 9A submitted Science project",
      //     "time": "Yesterday",
      //     "severity": "low"
      //   }
      // ],
      "feeCollectionStatus": {
        "monthlyStats": [
          { "month": "Jan", "percentage": 90 },
          { "month": "Feb", "percentage": 85 },
          { "month": "Mar", "percentage": 88 },
          { "month": "Apr", "percentage": 86 },
          { "month": "May", "percentage": 89 },
          { "month": "Jun", "percentage": 87 },
          { "month": "Jul", "percentage": 84 }
        ]
      },
      "recentPayments": [
        {
          "name": "Ashish more",
          "class": "7A",
          "amount": 350,
          "date": "2025-04-17",
          "time": "9:45 AM"
        },
        {
          "name": "Girish",
          "class": "8B",
          "amount": 350,
          "date": "2025-04-17",
          "time": "8:32 AM"
        },
        {
          "name": "Test User",
          "class": "9C",
          "amount": 350,
          "date": "2025-04-16",
          "time": ""
        },
        {
          "name": "test 2",
          "class": "10A",
          "amount": 350,
          "date": "2025-04-16",
          "time": ""
        }
      ],
      "outstandingPayments": [
        {
          "name": "Liam Johnson",
          "class": "10C",
          "amount": 350,
          "overdueBy": "3 days"
        },
        {
          "name": "Olivia Brown",
          "class": "7B",
          "amount": 350,
          "overdueBy": "5 days"
        },
        {
          "name": "William Taylor",
          "class": "9A",
          "amount": 350,
          "overdueBy": "7 days"
        },
        {
          "name": "Ava Smith",
          "class": "10B",
          "amount": 350,
          "overdueBy": "7 days"
        }
      ]
    }
  }
  try {
    res.status(httpStatus.OK).json(mockDashboardData);
  } catch (error) {
    next(error)
  }
})


module.exports = router;