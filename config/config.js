const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../.env") });

const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string()
            .valid("production", "development", "test")
            .default("development")
            .required(),
        PORT: Joi.number().default(3000),
        FRONTEND_URL: Joi.string().required().description("Frontend url"),
        MONGODB_URL: Joi.string().required().description("Mongo DB url"),
        ALLOWED_ORIGINS: Joi.string().description("List of CORS Allowed origins"),
        JWT_SECRET: Joi.string().required().description("JWT secret key"),
        JWT_EXPIRY: Joi.string().description("JWT expiration time "),
        MAX_UPLOAD_SIZE: Joi.number().description("Maximum upload size in bytes"),
        GOOGLE_CLIENT_ID: Joi.string().required().description("Google client ID"),
        GOOGLE_CLIENT_SECRET: Joi.string().required().description("Google client secret"),
        GOOGLE_REDIRECT_URI: Joi.string().required().description("Google redirect URI"),
        MAIL_SENDER_API_KEY: Joi.string().required().description("Mail sender api key"),
        MAIL_SENDER_FROM_EMAIL: Joi.string().email().required().description("Mail sender from email"),
        MAIL_SENDER_FROM_NAME: Joi.string().required().description("Mail sender from name")

    })
    .unknown();

const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: "key" } })
    .validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    frontend: envVars.FRONTEND_URL,
    mongoose: {
        url: envVars.MONGODB_URL,
        options: {},
    },
    cors: {
        allowedOrigins: envVars.ALLOWED_ORIGINS,
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        expiry: envVars.JWT_EXPIRY,
    },
    upload: {
        maxSize: envVars.MAX_UPLOAD_SIZE,
    },
    google: {
        clientId: envVars.GOOGLE_CLIENT_ID,
        clientSecret: envVars.GOOGLE_CLIENT_SECRET,
        redirectUri: envVars.GOOGLE_REDIRECT_URI,
    },
    mailSender: {
        apiKey: envVars.MAIL_SENDER_API_KEY,
        fromEmail: envVars.MAIL_SENDER_FROM_EMAIL,
        fromName: envVars.MAIL_SENDER_FROM_NAME
    }
};