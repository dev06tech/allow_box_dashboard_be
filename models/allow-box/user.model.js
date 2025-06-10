const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const logger = require("../../config/logger");
const { default: httpStatus } = require("http-status");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
            if (!value.match(/^[a-zA-Z ]+$/)) {
                throw new Error("Name must contain only letters and spaces");
            }
        },
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
        enum: ["super-admin", "teacher", "student", "parent", "support", "staff"],
        default: null,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    registrationToken: [
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
    },
    registeredVia: {
        type: String,
        enum: ["email", "google", "slate", "allow-box"],
        default: "email",
    },
    passworResetToken: {
        type: String,
    },
    tokens: [
        {
            token: {
                type: String
            },
        },
    ],
    associatedSchool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School"
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateRegistrationToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, config.jwt.secret, {
        expiresIn: config.jwt.expiry,
    });
    user.registrationToken = user.registrationToken.concat({ token });
    await user.save();
    return token;
};

userSchema.methods.generatePasswordResetToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, config.jwt.secret, {
        expiresIn: config.jwt.expiry,
    });
    user.isLoggedIn = false;
    user.tokens = [];
    user.passworResetToken = token;
    await user.save();
    return token;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, config.jwt.secret, {
        expiresIn: config.jwt.expiry,
    });
    user.tokens = user.tokens.concat({ token });
    user.isLoggedIn = true;
    await user.save();
    return token;
};

userSchema.methods.getPublicProfile = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.registrationToken;
    delete userObject.tokens;
    delete userObject.passworResetToken;

    return userObject;
};

userSchema.statics.findByEmailCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw {
            statusCode: httpStatus.NOT_FOUND,
            message: "Incorrect email or password"
        };
    }
    if (!user.isEmailVerified) {
        throw {
            statusCode: httpStatus.FORBIDDEN,
            message: "Please verify your email first"
        };
    }
    if(user.isLoggedIn) {
        throw {
            statusCode: httpStatus.FORBIDDEN,
            message: "User already logged in, Please logout and try again"
        };
    }
    if(user.isBlocked) {
        throw {
            statusCode: httpStatus.FORBIDDEN,
            message: "Your account has been blocked"
        };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw {
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Incorrect email or password"
        };
    }
    return user;
};

userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();

    if (update && typeof update === 'object' && !Array.isArray(update)) {
        if (update.password) {
            const hashed = await bcrypt.hash(update.password, 8);
            update.password = hashed;
            update.tokens = [];
            update.isLoggedIn = false;

            this.setUpdate(update);
        }
    }

    next();
});

userSchema.set("timestamps", true);

userSchema.index({ createdAt: 1 });

const User = mongoose.model("user", userSchema);

module.exports = User;