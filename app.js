const express = require("express");
const http = require("http");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const httpStatus = require("http-status");
const config = require("./config/config");
const morgan = require("./config/morgan");
const { authLimiter } = require("./middlewares/rateLimiter");
const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");

//Routes
const userRoutes = require('./routes/allow-box/user.routes');
const classRoutesAllowBox = require('./routes/allow-box/class.routes');
const schoolRoutesAllowBox = require('./routes/allow-box/school.routes');
const superAdminRoutes = require('./routes/slate/superAdmin.routes');
const schoolRoutesSlate = require('./routes/slate/school.routes');
const classRoutesSlate = require('./routes/slate/class.routes');
const emailTemplateRoutes = require('./routes/slate/emailTemplates.routes');

const app = express();
const server = http.createServer(app);

if (config.env !== "test") {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
  }

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, decode: decodeURIComponent }));

// sanitize request data
app.use((req, res, next) => {
  if (req.path === '/api/slate/email-template/create') {
    // Skip xss() for this route
    return next();
  }
  
  // Apply xss() normally
  xss()(req, res, next);
});
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
const allowedOrigins = config.cors.allowedOrigins?.split(",") || [];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}

app.use("/api/allow-box/user", userRoutes);
app.use("/api/allow-box/class", classRoutesAllowBox);
app.use("/api/allow-box/school", schoolRoutesAllowBox);
app.use("/api/slate/super-admin", superAdminRoutes);
app.use("/api/slate/school", schoolRoutesSlate);
app.use("/api/slate/class", classRoutesSlate);
app.use("/api/slate/email-template", emailTemplateRoutes);

app.get('/', (req, res) => {
  res.status(200).send('API is up and running');
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next( new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = { app, server };