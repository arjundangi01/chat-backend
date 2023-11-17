const messageModel = require("../models/message.model");
const UserModel = require("../models/user.mode");
const express = require("express");

const messageRouter = express.Router();

messageRouter.post("/", async (req, res) => {
  const { sender } = req.body;
  try {
    const user = await UserModel.findById(sender);
    const newMessage = await messageModel.create({
      ...req.body,
      senderImage: user.profileImage,
    });
    res.send(newMessage);
  } catch (err) {
    console.log(err);
      res.send({ error: err });
  }
});

messageRouter.get("/:conversationId", async (req, res) => {
  const { conversationId } = req.params
  // console.log('in con get',conversationId)
  try {
    const messages = await messageModel.find({
      conversationId,
    });
  // console.log('in con get',messages)

    res.send(messages);
  } catch (err) {
    res.send({ error: err });
  }
});

module.exports = messageRouter