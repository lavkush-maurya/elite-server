const route = require("express").Router()
const { searchController } = require("../controllers/search.controller");

route.get("/search/:key", searchController);

module.exports = route;