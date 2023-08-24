const route = require("express").Router();
const {
  signUp,
  login,
  adminLogin,
  resetPassword,
  forgotPassword,
  logout,
} = require("../controllers/auth.controller");

route.post("/auth/signup", signUp);
route.post("/auth/login", login);
route.get("/auth/logout", logout);
route.post("/admin/login", adminLogin);
route.post("/auth/reset/password/:resetToken", resetPassword);
route.post("/auth/forget/password", forgotPassword);

module.exports = route;
