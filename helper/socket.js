//Socket io implimentation
const CustomError = require("./customError");
const socketIo = require("socket.io");

let io;

module.exports = {
   init: (server) => {
      io = socketIo(server, {
         cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type'],
         }
      });
      return io;
   },
   getIO: () => {
      if (!io) {
         throw new CustomError(400, "Socket.IO not initialized!");
      }
      return io;
   }
};
