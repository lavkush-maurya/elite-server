const route = require("express").Router();
const { getAdminAnalyticsData } = require("../controllers/adminAnalytics.controller");
const { isAuthenticated } = require("../middlewares/authMiddleware");

//Admin Anlalytics Data Route
route.get("/admin/analytics", isAuthenticated, getAdminAnalyticsData);

module.exports = route;