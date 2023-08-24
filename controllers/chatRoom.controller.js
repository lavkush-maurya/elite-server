const ChatRoom = require("../models/chatRoom.schema");
const CustomError = require("../helper/customError");
const errorResponse = require("../helper/errorResponse");

/*********************************************************
Add a new chat room.
@route POST /api/v1/create/chat-room
@param {string} user.required - Id of the chat room user
@param {string} admin.required - Id of the chat room admin
@returns {object} 201 - Success message and chat room object
@throws {CustomError} 400 - Sender and Receiver Id are Required
@throws {CustomError} 500 - Internal server error
***************************************************************/
module.exports.addChatRoom = async (req, res) => {
  try {
    const { user, admin } = req.body;
    if (!user || !admin) {
      throw new CustomError(400, "Sender and Receiver Id are Required")
    };
    const existingChatRoom = await ChatRoom.find({ user, admin })

    if (existingChatRoom.length > 0) {
      return res.status(200).json('ChatRoom already exists!')
    } else {
      const chatRoom = await ChatRoom.create({
        admin,
        user
      });
      return res.status(201).json({ sussess: true, chatRoom })
    }

  } catch (err) {
    errorResponse(res, err, "ADD-CHAT-ROOM")
  }
}

/**********************************************************
Get all chat rooms.
@route GET /api/v1/chat-rooms/all
@returns {object} 200 - Success message and an array of chat room objects
@throws {CustomError} 400 - No Chat Room found!
@throws {CustomError} 500 - Internal server error
***************************************************************/
module.exports.getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find().populate({
      path: 'user',
      select: 'name email image messages',
    });
    if (!chatRooms) {
      throw new CustomError(400, "No Chat Room found!")
    };

    return res.status(200).json({ success: true, chatRooms })
  } catch (err) {
    errorResponse(res, err, "GET-CHAT-ROOMS")
  }
}

/**********************************************************
Get chat room by user ID.
@route GET /api/v1/chat-room/:userId
@param {string} userId.required - ID of the user whose chat room is to be fetched
@returns {object} 200 - Chat room object
@throws {CustomError} 404 - Chat Room not found!
@throws {CustomError} 500 - Internal server error
***************************************************************/
module.exports.getChatRoomByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new CustomError(404, 'Chat Room not found!')
    }
    const chatRoom = await ChatRoom.find({ user: userId })
    res.status(200).json(chatRoom)
  } catch (err) {
    errorResponse(res, err, 'GET-CHAT-ROOM-BY-ID')
  }
}