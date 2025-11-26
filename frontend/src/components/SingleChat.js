import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast, Button } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

// 🔥 Hardcoded backend URL
const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
  };

  const fetchMessages = async () => {
    if (!selectedChat || !user?.token) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        position: "bottom",
      });
    }
  };

  // ---------- TEXT MESSAGE SEND ----------
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage && selectedChat) {
      socket.emit("stop typing", selectedChat._id);

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-type": "application/json",
          },
        };

        const { data } = await axios.post(
          `/api/message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        setNewMessage("");
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch {
        toast({
          title: "Message Send Failed",
          status: "error",
          duration: 4000,
        });
      }
    }
  };

  // ---------- FILE UPLOAD ----------
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedChat) return;

    try {
      setLoadingFile(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadConfig = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const { data: fileData } = await axios.post(
        `${ENDPOINT}/api/message/upload`,
        formData,
        uploadConfig
      );

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `/api/message`,
        {
          chatId: selectedChat._id,
          fileUrl: fileData.fileUrl,
          fileName: fileData.fileName,
          fileType: fileData.fileType,
          fileSize: fileData.fileSize,
        },
        config
      );

      socket.emit("new message", data);
      setMessages([...messages, data]);
      setSelectedFile(null);
      setLoadingFile(false);
    } catch {
      toast({
        title: "File Send Failed",
        status: "error",
        duration: 4000,
      });
      setLoadingFile(false);
    }
  };

  // ---------- SOCKET.IO ----------
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, [user]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMsg) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMsg.chat._id) {
        if (!notification.some((n) => n._id === newMsg._id)) {
          setNotification([newMsg, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMsg]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let timeout = 3000;
    setTimeout(() => {
      setTyping(false);
      socket.emit("stop typing", selectedChat._id);
    }, timeout);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            d="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>

          <Box d="flex" flexDir="column" justifyContent="flex-end" p={3} h="100%" bg="#E8E8E8" borderRadius="lg">
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
            ) : (
              <ScrollableChat messages={messages} />
            )}

            {/* FILE UPLOAD UI */}
            <Box d="flex" gap={2} my={2} alignItems="center">
              <input type="file" id="file-input" style={{ display: "none" }} onChange={handleFileChange} />
              <Button onClick={() => document.getElementById("file-input").click()} isLoading={loadingFile}>
                📎
              </Button>

              {selectedFile && (
                <Text fontSize="xs" maxW="150px" isTruncated>
                  {selectedFile.name}
                </Text>
              )}

              <Button disabled={!selectedFile || loadingFile} onClick={handleSendFile}>
                Send File
              </Button>
            </Box>

            {/* TEXT INPUT */}
            <FormControl onKeyDown={sendMessage} mt={3}>
              {istyping && <Lottie options={defaultOptions} width={60} />}
              <Input placeholder="Enter a message..." value={newMessage} onChange={typingHandler} bg="#E0E0E0" />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" justifyContent="center" alignItems="center" h="100%">
          <Text fontSize="3xl" fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
