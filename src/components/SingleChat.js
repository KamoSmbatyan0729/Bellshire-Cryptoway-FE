import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { Spinner, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { useRef } from "react";
import { ChatState } from "../Context/ChatProvider";
import { MdEdit } from "react-icons/md";
import { MdOutlineClose } from "react-icons/md";
import EmojiPicker from 'emoji-picker-react';
import { MdEmojiEmotions } from "react-icons/md";
import { SocketContext } from "../Context/SocketContext";
import { useContext, useCallback } from "react";
import { useDropzone } from 'react-dropzone'
import { FaRegFile } from "react-icons/fa";
import { DeleteIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
var selectedChatCompare;

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
  const { socket } = useContext(SocketContext);
  const [fileAttach, setFileAttach] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const onDrop = useCallback(acceptedFiles => {
    setAttachedFiles((prev) => [...prev, ...acceptedFiles]);
    setFileAttach(true);
    inputRef.current?.focus();
  }, [setFileAttach, setAttachedFiles])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})  
  const [fileUpload, setFileUpload] = useState(false);
  const emojiRef = useRef(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedGroup, user, notification, setNotification, selectedServer } =
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setClickEmoji(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && (newMessage || attachedFiles.length > 0)) {
      if(editMode){
        try {
          socket.emit("edit message", {groupId: selectedGroup.id, messageId: editMessage.id, newContent: newMessage, serverId: selectedServer.id});
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
          return ;
        }
      }

      socket.emit("stop typing", selectedServer.id);
      try {
        setNewMessage("");
        if (attachedFiles.length !== 0){
          let messageId = null;
          const formData = new FormData();
          attachedFiles.forEach((file) => {
            formData.append("files", file);
          });
          formData.append("groupId", selectedGroup.id);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "multipart/form-data",
            },
          };
          setFileUpload(true);
          const response = await axios.post("/api/upload", formData, config);
          setFileUpload(false);
          setAttachedFiles([])
          setFileAttach(false)
          messageId = response.data.messageId;
          socket.emit("new message", {content: newMessage, groupId: selectedGroup.id, serverId: selectedServer.id, messageId: messageId});
        } else {
          socket.emit("new message", {content: newMessage, groupId: selectedGroup.id, serverId: selectedServer.id});
        }
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
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    

    // eslint-disable-next-line
  }, [socket]);

  useEffect(() => {
    socket.on("message received", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat

        selectedChatCompare.id !== newMessageRecieved.group_id
      ) { 
        if (!notification.some((n) => newMessageRecieved.id === n.id)) {
          setNotification([...notification, newMessageRecieved ].slice(0, 10));
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
    socket.on("delete message", (messageId) => {
      const filteredMessages = messages.filter(
        (msg) => msg.id !== messageId
      );
      setMessages(filteredMessages);

    })
    socket.on("edit message", (message) => {  
      const updatedMessages = messages.map((msg) =>
        msg.id === message.id ? message : msg
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
        socket.emit("stop typing", selectedServer.id);
        setTyping(false);
      }
      return;
    }

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedServer.id);
    }

    lastTypingTimeRef.current = new Date().getTime();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTimeRef.current;

      if (timeDiff >= 3000 && typing) {
        socket.emit("stop typing", selectedServer.id);
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
    socket.emit("delete message", {messageId: messageId, groupId: selectedGroup.id, serverId: selectedServer.id});
  }
  function handleCloseEditMode(){
    setEditMode(false)
    setEditMessage(null);
    setNewMessage('')
  }
  function handleCloseAttachMode(){
    setFileAttach(false)
    setAttachedFiles([]);
  }
  function onClickEmoji(e){
    setNewMessage(prev => prev + e.emoji);
    setClickEmoji(false);
  }
  const handleRemoveFile = (fileToRemove) => {
    setAttachedFiles((prev) => {
      const updated = prev.filter((file) => file !== fileToRemove);

      if (updated.length === 0) {
        setFileAttach(false);
      }

      return updated;
    });
  };
  return (
    <>
      {selectedGroup ? (
        <Box className="w-full h-full relative !bg-gray-500" {...getRootProps()}>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="dark"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
            className="relative"
          > 
            {
              isDragActive &&
              <div className={
                    "absolute top-0 left-0 w-full h-full bg-black transition-opacity duration-300 z-100 " +
                    (isDragActive ? "opacity-80" : "opacity-0")
                  }
              >
                <input {...getInputProps()} />
                <div className="w-full h-full flex items-center justify-center text-white text-lg">
                  <div className="rounded-xl bg-[#5864F2] text-white p-3 text-center">
                    <div className="rounded-xl border-white p-5 m-2 border-dashed">
                      <p className="text-2xl font-bold">Upload To {selectedGroup.group_name}</p>
                      <p>you can add comments before uploading.</p>
                    </div>
                  </div>
                </div>
              </div>
            }
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
                <div className="flex items-center justify-between p-3 bg-gray-700">
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
              {
                (fileAttach && attachedFiles.length > 0) &&
                <div className="flex items-center justify-between p-3 relative bg-gray-700">
                  {
                    fileUpload &&
                    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black opacity-70 z-100">
                        <Spinner
                          thickness='4px'
                          speed='0.65s'
                          emptyColor='gray.200'
                          color='blue.500'
                          size='xl'
                        />
                    </div>
                  }
                  <div className="flex items-center">
                    {
                      attachedFiles.map((file, index) => {
                        return <div className="flex items-center" key={index}>
                          <div className="rounded-lg p-20 flex justify-center items-center relative bg-gray-900 me-3">
                            <FaRegFile size={30} />
                            <IconButton className="!absolute top-2 right-2" size="xs" aria-label='Remove File' colorScheme="red" icon={<DeleteIcon size={10}/>} onClick={() => handleRemoveFile(file)}/>
                            <p className="absolute bottom-2 left-2 text-xs">{file.name}</p>
                          </div>
                        </div>
                      })
                    }
                  </div>
                  <div>
                    <MdOutlineClose className="cursor-pointer" onClick={handleCloseAttachMode}/>
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
                disabled={fileUpload}
                className="!bg-gray-700 text-white"
              />
              <div ref={emojiRef} className="absolute right-5 bottom-[6px] cursor-pointer" onClick={() => {setClickEmoji(!clickEmoji)}}>
                <MdEmojiEmotions size={30}/>
              </div>
              {
                clickEmoji &&
                <div className="absolute right-0 bottom-[105%]">
                  <EmojiPicker onEmojiClick={onClickEmoji}/>
                </div>
              }
            </FormControl>
          </Box>
        </Box>
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
