const route = require("express").Router();
const { addMessage, getMessages } = require("../controllers/messages.controller");
const { isAuthenticated } = require('../middlewares/authMiddleware')

//Add new Chat message route
route.post("/new/message/:chatRoomId", isAuthenticated, addMessage);
route.get("/messages/:chatRoomId", isAuthenticated, getMessages)

module.exports = route;