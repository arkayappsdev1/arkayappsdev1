const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
// const listEndpoints = require('express-list-endpoints')

// user routes
const userHome = require("./router/user/home");
const subServices = require("./router/user/subService");
const userRoute = require("./router/user/user");
const services = require("./router/user/services");
const userSecurity = require("./router/user/security");

// Provider routes
const providerService = require("./router/provider/services")
const providerCategory = require("./router/provider/catagory")

// admin routes
const adminAuth = require("./router/admin/auth");
const addBanner = require("./router/admin/banner");
const adminSecurity = require("./router/admin/security");
const adminExperience = require("./router/admin/experienceQuestions");
const IssueQuestion = require("./router/admin/issues");
const adminServices = require("./router/admin/services");
const adminSubService = require("./router/admin/subService");
const adminUsers = require("./router/admin/users");
const adminBookings = require("./router/admin/bookings");
const adminCountry = require("./router/admin/country");

// notification

const notification = require("./router/notification/notify")

// multiple language support

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: {
      loadPath: "locales/{{lng}}/translation.json",
    },
  });

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOptions));
app.use(middleware.handle(i18next));
app.use(express.json());
// app.use(express.urlencoded({ extended: true }))

app.use(morgan("dev"));
app.use(express.static("uploads/profilePic"));
app.use(express.static("uploads/documents"));
app.use(express.static("uploads/issueDocuments"));
app.use(express.static("uploads/subServices"))
app.use(express.static("uploads/banners"))
app.use(express.static("uploads/services"))
app.use(express.static("uploads/taskImages"))
app.use(express.static("uploads/categoryDocumets"))

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Customer side
app.use("/api/v1/consumer", userHome);
app.use("/api/v1/consumer", subServices);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/consumer", services);
app.use("/api/v1/consumer", userSecurity);

// Provider side
app.use("/api/v1/provider", providerService);
app.use("/api/v1/provider", providerCategory);

// Admin side
app.use("/api/v1/admin", adminAuth);
app.use("/api/v1/admin", adminServices);
app.use("/api/v1/admin", addBanner);
app.use("/api/v1/admin", adminSecurity);
app.use("/api/v1/admin", adminExperience);
app.use("/api/v1/admin", IssueQuestion);
app.use("/api/v1/admin", adminSubService);
app.use("/api/v1/admin", adminUsers);
app.use("/api/v1/admin", adminBookings);
app.use("/api/v1/admin", adminCountry);

// notifications side
app.use("/api/v1",notification);



// console.log(listEndpoints(app))

module.exports = app;
