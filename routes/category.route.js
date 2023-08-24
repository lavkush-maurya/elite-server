const route = require("express").Router();
const {
   getAllCategories,
   createCategory,
   editCategory,
   removeCategory,
   getSingleCategory
} = require("../controllers/category.controller");

const { isAuthenticated } = require("../middlewares/authMiddleware");
const { fileUploader, updateFile } = require("../middlewares/imgUpload.middleware");

route.get(
   "/categories/all",
   getAllCategories
);

route.get(
   "/category/single/:categoryId",
   getSingleCategory
);

route.post(
   "/category/create",
   isAuthenticated,
   fileUploader,
   createCategory
);

route.put(
   "/category/edit/:categoryId",
   isAuthenticated,
   updateFile,
   editCategory
);

route.delete(
   "/category/remove/:categoryId",
   isAuthenticated,
   updateFile,
   removeCategory
);

module.exports = route;
