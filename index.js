const connection = require("./config/db");
const express = require("express");
const http = require("http");

const cors = require("cors");
const userRouter = require("./routes/user.routes");
const messageRouter = require("./routes/message.routes");
const conversationRouter = require("./routes/conversation.routes");
const { log } = require("console");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000",'https://elaborate-shortbread-8d0fc5.netlify.app'],
  })
);
app.use(express.json());
const PORT = process.env.PORT;
app.get('/', (req,res) => {
  res.send('welcome')
})
app.use("/users", userRouter);
app.use("/messages", messageRouter);
app.use("/conversations", conversationRouter);

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000",'https://elaborate-shortbread-8d0fc5.netlify.app'],
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //on connection
  // console.log("a user connected");f
  //take userId and socket Id from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
   socket.on("sendMessage", ({ senderId, receiverId, text, senderImage }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderImage,
        senderId,
        text,
      });
    }
  });

  //disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(PORT, "0.0.0.0", async () => {
  try {
    await connection;

    console.log("database connected");
  } catch (error) {
    console.log("error while listening", error);
  }
});
