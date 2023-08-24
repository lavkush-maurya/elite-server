const route = require("express").Router();
const { userProfile, updateUserProfile, allUserProfiles, updateAdminProfile } = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/authMiddleware");
const { fileUploader } = require("../middlewares/imgUpload.middleware")

//User Profile Update 
route.put("/user/update/profile/:userId", isAuthenticated, fileUploader, updateUserProfile);
//Admin Profile update 
route.post("/admin/update/profile/:adminId", isAuthenticated, fileUploader, updateAdminProfile);

route.get("/user/profile/:userId", isAuthenticated, userProfile);
route.get("/user/all/profile", isAuthenticated, allUserProfiles);

module.exports = route;