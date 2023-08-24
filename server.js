const config = require("./config/index");
const app = require("./index");
const mongoose = require("mongoose");
const { init } = require("./helper/socket");

(async () => {
   try {
      await mongoose.connect(config.DB_URL, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
      });
      console.log("Database Connected Successfully");

      app.on("error", (error) => {
         console.log(error, "Database Error");
         throw error;
      });

      const onListining = () => {
         console.log(`Server is Up and Running on Port:${config.PORT}`);
      };
      const server = app.listen(config.PORT, onListining);

      // Socket.io
      const io = init(server);

      let users = [];

      const addUser = (userId, socketId) => {
         !users.some((user) => user.id === userId) &&
            users.push({ userId, socketId });
      };
      // console.log(users)
      const removeUser = (socketId) => {
         users = users.filter((user) => user.socketId !== socketId);
      };

      const getUser = (userId) => {
         return users.find((user) => user.userId === userId);
      };

      io.on("connection", (socket) => {
         // when connect
         console.log("a user connected.");
         // take userId from user
         socket.on("addUser", (userId) => {
            addUser(userId, socket?.id);
            io.emit("getUsers", users);
         });

         // send and get message
         socket.on("sendMessage", ({ sender, receiver, message, roomId }) => {
            const user = getUser(receiver)
            io.to(user?.socketId).emit("getMessage", {
               sender,
               message,
               receiver,
               chatRoom: roomId,
               createdAt: new Date()
            });
         });

         // when disconnect
         socket.on("disconnect", () => {
            console.log("a user disconnected!");
            removeUser(socket.id);
            io.emit("getUsers", users);
         });
      });
   } catch (error) {
      console.log("connection failed");
      throw error;
   }
})();