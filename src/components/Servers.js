import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect } from "react";
import ChatLoading from "./ChatLoading";
import ServerChatModal from "./miscellaneous/ServerChatModal";
import ConfirmModal from "./miscellaneous/ConfirmModal";
import { Button, IconButton } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { IoMdExit } from "react-icons/io";
import { SocketContext } from "../Context/SocketContext";
import {useContext} from "react";



const MyChats = ({ fetchAgain }) => {

  const { selectedServer, setSelectedServer, user, myServers, setMyServers, joinedServers, setJoinedServers, setSelectedGroup, setGroups, selectContact, setSelectContact } = ChatState();
  const { socket } = useContext(SocketContext);

  const toast = useToast();

  const fetchMyServer = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat/server/get-servers", config);
      setMyServers(data.myserver);
      setJoinedServers(data.joinedserver)
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleRemoveServer = async (serverId) => {    
    socket.emit('delete server', {serverId: serverId});
  }

  useEffect(() => {
    socket.on('delete server', (data) => {
      setMyServers(data);
      setSelectedServer(null)
    })
    socket.on("leave server", (data) => {
      setJoinedServers(data);
      setSelectedServer(null);
      setSelectedGroup(null);
      setGroups([])
    })
  })
  
  const handleLeaveServer = async (serverId) => {
    socket.emit('leave server', {serverId: serverId});
  }

  useEffect(() => {
    fetchMyServer();
    // eslint-disable-next-line
  }, [fetchAgain]);

  function handleClickServer(server){
    setSelectContact(false)
    setSelectedServer(server);
    setSelectedGroup(null)
    socket.emit("join server", server.id)
  }

  function handleClickDM(){
    setSelectContact(true);
    setSelectedServer(null)
    setSelectedGroup(null)
  }

  return (
    <Box
      d={{ base: selectedServer ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="dark"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      className=" text-white border-nont"
    >
      <Box className="p-3 w-full">
        <Box
          onClick={handleClickDM}
          cursor="pointer"
          bg={selectContact ? "#707c8d" : "#4a5565"}
          color={selectContact ? "white" : "black"}
          px={3}
          py={2}
          borderRadius="lg"
          className="!text-white"
        >
          <Text>
            Direct Messages
          </Text>
        </Box>
      </Box>
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        Servers
        <ServerChatModal>
          <Button
            className="add-server-btn"
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            colorScheme="dark"
          >
          </Button>
        </ServerChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
        className="bg-gray-600"
      >
        <Text className="!mb-3">
          My Servers
        </Text>
        {myServers ? (
          <Stack overflowY="scroll">
            {myServers.map((server) => (
              <Box
                onClick={() => handleClickServer(server)}
                cursor="pointer"
                bg={selectedServer === server ? "#707c8d" : "#4a5565"}
                color={selectedServer === server ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                className="flex justify-between items-center !text-white !border-2 !border-gray-400"
                key={server.id}
              >
                <Text>
                  {server.server_name}
                </Text>
                <ConfirmModal title={"Confirm Removal"} description="Are you sure you want to remove?" onConfirm={() => handleRemoveServer(server.id)}>
                  <IconButton aria-label='Remove Server' colorScheme="dard" icon={<DeleteIcon />} />
                </ConfirmModal>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
        <Text className="!my-3">
          Joined Servers
        </Text>
        {joinedServers ? (
          <Stack overflowY="scroll">
            {joinedServers.map((server) => (
              <Box
                onClick={() => handleClickServer(server)}
                cursor="pointer"
                bg={selectedServer === server ? "#707c8d" : "#4a5565"}
                color={selectedServer === server ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={server.id}
                className="flex justify-between items-center !text-white !border-2 !border-gray-400"
              >
                <Text>
                  {server.server_name}
                </Text>
                <ConfirmModal title={"Leave Confirmation"} description="Are you sure you want to leave?" onConfirm={() => handleLeaveServer(server.id)}>
                  <IconButton aria-label='Leave Server' colorScheme="dark" icon={<IoMdExit size={20}/>} />
                </ConfirmModal>                
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
