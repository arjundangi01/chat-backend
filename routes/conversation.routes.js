const conversationModel = require("../models/conversation.model");
const express = require("express");

const conversationRouter = express.Router();



conversationRouter.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;
  // console.log(senderId)
  try { 
    const existingConversation = await conversationModel.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (!existingConversation) {
      const newConversation = await conversationModel.create({
        members: [senderId, receiverId],
      });

      return res.send(newConversation);
    }
    // console.log('e',existingConversation)

    res.send(existingConversation);
  } catch (error) {
    console.log(error);
    res.send({ message: "Error in post conversation" });
  }
});

conversationRouter.get("/:userId", async (req, res) => {
  const { userId } = req.params
  // console.log('get',userId)
  try {
    const userConversations = await conversationModel.find({
      members: { $in: [userId] },
    });
    // console.log(userConversations)
    res.send(userConversations);
  } catch (err) {
    console.log(err);
    res.send({ message: "Error while getting conversation" });
  }
});

module.exports = conversationRouter;
