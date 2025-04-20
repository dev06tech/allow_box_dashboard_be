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
        ALLOWED_ORIGINS: Joi.string().description("List of CORS Allowed origins")
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

};