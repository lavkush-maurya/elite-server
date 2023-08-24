const route = require("express").Router();
const { addChatRoom, getChatRooms, getChatRoomByUserId } = require("../controllers/chatRoom.controller");
const { isAuthenticated } = require('../middlewares/authMiddleware')

route.get("/chat-rooms/all", isAuthenticated, getChatRooms);
route.get("/chat-room/:userId", isAuthenticated, getChatRoomByUserId);

route.post("/create/chat-room", addChatRoom);

module.exports = route;