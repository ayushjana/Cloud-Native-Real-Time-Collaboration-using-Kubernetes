const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// @desc    Get all Messages
// @route   GET /api/message/:chatId
// @access  Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Create New Message (text and/or file)
// @route   POST /api/message
// @access  Protected
const sendMessage = asyncHandler(async (req, res) => {
  const {
    content,
    chatId,
    fileUrl,
    fileName,
    fileType,
    fileSize
  } = req.body;

  if (!chatId && !fileUrl && !content) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessageData = {
    sender: req.user._id,
    chat: chatId,
  };

  if (content) newMessageData.content = content;
  if (fileUrl) {
    newMessageData.fileUrl = fileUrl;
    if (fileName) newMessageData.fileName = fileName;
    if (fileType) newMessageData.fileType = fileType;
    if (fileSize) newMessageData.fileSize = fileSize;
  }

  try {
    let message = await Message.create(newMessageData);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await Chat.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
