import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { useRef } from "react";
import io from "socket.io-client";
import { ChatState } from "../Context/ChatProvider";
import { MdEdit } from "react-icons/md";
import { MdOutlineClose } from "react-icons/md";
import EmojiPicker from 'emoji-picker-react';
import { MdEmojiEmotions } from "react-icons/md";
const ENDPOINT = process.env.REACT_APP_BACKEND_URL;
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(null);
  const inputRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [editMessage, setEditMessage] = useState(null);
  const [clickEmoji, setClickEmoji] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedGroup, setSelectedGroup, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedGroup) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/get-messages/${selectedGroup.id}`,
        config
      );
      setMessages(data.messages);
      setLoading(false);

      socket.emit("join group", selectedGroup.id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      if(editMode){
        try {
          socket.emit("edit message", {groupId: selectedGroup.id, messageId: editMessage.id, newContent: newMessage});
          setEditMode(false)
          setEditMessage(null);
          setNewMessage("");
          return ;
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      }
      socket.emit("stop typing", selectedGroup.id);
      try {
        setNewMessage("");
        socket.emit("new message", {content: newMessage, groupId: selectedGroup.id});
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT, {
      auth: { token: user.token },
    });
    socket.emit("setup", user);
    // socket.on("connected", () => setSocketConnected(true));
    // socket.on("typing", () => setIsTyping(true));
    // socket.on("stop typing", () => setIsTyping(false));
    

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("message received", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare.id !== newMessageRecieved[0].id
      ) { 
        if (!notification.some((n) => newMessageRecieved[0].id === n.id)) {
          setNotification([...notification, newMessageRecieved[0] ].slice(0, 10));
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved[0]]);
      }
    });
    socket.on("delete message", (messageId) => {
      const filteredMessages = messages.filter(
        (msg) => msg.id !== messageId
      );
      setMessages(filteredMessages);

    })
    socket.on("edit", (message) => {  
      const updatedMessages = messages.map((msg) =>
        msg.id === message[0].id ? message[0] : msg
      );
      setMessages(updatedMessages);
    })
  })

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedGroup;
    // eslint-disable-next-line
  }, [selectedGroup]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (e.target.value.trim() === "") {
      if (typing) {
        socket.emit("stop typing", selectedGroup.id);
        setTyping(false);
      }
      return;
    }

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedGroup.id);
    }

    lastTypingTimeRef.current = new Date().getTime();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTimeRef.current;

      if (timeDiff >= 3000 && typing) {
        socket.emit("stop typing", selectedGroup.id);
        setTyping(false);
      }
    }, 3000);
  };
  function handleEdit(message){
    setEditMode(true);
    setEditMessage(message)
    setNewMessage(message.content)
    inputRef.current?.focus();
  }
  function handleRemove(messageId){
    socket.emit("delete message", {messageId: messageId, groupId: selectedGroup.id});

  }
  function handleCloseEditMode(){
    setEditMode(false)
    setEditMessage(null);
    setNewMessage('')
  }
  return (
    <>
      {selectedGroup ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedGroup("")}
            />
            {/* {messages &&
              (!selectedGroup.isGroupChat ? (
                <>
                  {getSender(user, selectedGroup.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedGroup.users)}
                  />
                </>
              ) : (
                <>
                  {selectedGroup.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))} */}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} handleEdit={handleEdit} handleRemove={handleRemove}/>
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
              className="relative"
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              {
                editMode &&
                <div className="flex items-center justify-between p-3 bg-[#e0e0e0]">
                  <div className="flex items-center">
                    <MdEdit />
                    <div className="ml-3">
                      <Text>Edit Message</Text>
                      <Text>{editMessage.content}</Text>
                    </div>
                  </div>
                  <div>
                    <MdOutlineClose className="cursor-pointer" onClick={handleCloseEditMode}/>
                  </div>
                </div>
              }
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
                ref={inputRef}
              />
              <div className="absolute right-5 bottom-[6px] cursor-pointer" onClick={() => {setClickEmoji(!clickEmoji)}}>
                <MdEmojiEmotions size={30}/>
              </div>
              {
                clickEmoji &&
                <div className="absolute right-0 bottom-[105%]">
                  <EmojiPicker />
                </div>
              }
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a group to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
