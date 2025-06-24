const roleVisibility = {
    "super-admin": null,
    "teacher": ["teacher", "student", "parent"],
    "support": ["teacher", "student", "staff", "support", "parent"],
    "staff": ["teacher", "student", "staff", "parent"]
};

module.exports = roleVisibility