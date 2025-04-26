const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { log } = require('winston');

const superAdminSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid");
            }
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        validate(value) {
            if (!value.match(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)) {
                throw new Error("Password must contain at least 1 uppercase letter, 1 number, and 1 special character");
            }
        }
    },
    role: {
        type: String,
        enum: ["super-admin"],
        default: "super-admin",
    },

    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
    isLoggedIn: {
        type: Boolean,
        default: false,
    }
});

superAdminSchema.set("timestamps", true);

superAdminSchema.pre("save", async function (next) {
    const superAdmin = this;
    if (superAdmin.isModified("password")) {
        superAdmin.password = await bcrypt.hash(superAdmin.password, 8);
    }
    next();
});
superAdminSchema.statics.findByEmailCredentials = async (email, password) => {
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
        throw new Error("Unable to login");
    }
    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
        throw new Error("Unable to login");
    }
    return superAdmin;
};
superAdminSchema.methods.generateAuthToken = async function () {
    const superAdmin = this;
    const token = jwt.sign({ _id: superAdmin._id.toString() }, config.jwt.secret, {
        expiresIn: config.jwt.expiry,
    });
    superAdmin.tokens = superAdmin.tokens.concat({ token });
    superAdmin.isLoggedIn = true;
    await superAdmin.save();
    return token;
};
superAdminSchema.methods.getPublicProfile = function () {
    const superAdmin = this;
    const superAdminObject = superAdmin.toObject();
    delete superAdminObject.password;
    delete superAdminObject.tokens;
    return superAdminObject;
};

const SuperAdmin = mongoose.model("super-admin", superAdminSchema);
module.exports = SuperAdmin;