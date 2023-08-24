const { Schema, model } = require("mongoose");

const chatRoomSchema = new Schema({
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }]
},
  {
    timestamps: true
  }
);

chatRoomSchema.index({ updatedAt: -1 });
const ChatRoom = model("ChatRoom", chatRoomSchema);
module.exports = ChatRoom;