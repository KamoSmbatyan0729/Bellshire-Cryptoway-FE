import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect } from "react";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import ConfirmModal from "./miscellaneous/ConfirmModal";
import { Button, IconButton } from "@chakra-ui/react";
import { SocketContext } from "../Context/SocketContext";
import {useContext} from "react";

const MyChats = ({ fetchAgain }) => {

  const { selectedGroup, setSelectedGroup, user, selectedServer, setGroups, groups, myServers } = ChatState();
  const { socket } = useContext(SocketContext);

  const toast = useToast();

    // eslint-disable-next-line
  const fetchGroups = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/chat/group/get-groups/${selectedServer.id}`, config);
      setGroups(data.groups);
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

  useEffect(() => {
    if(selectedServer) fetchGroups();
    // eslint-disable-next-line
  }, [fetchAgain, selectedServer]);

  useEffect(() => {
    if(socket){
      socket.on('delete group', (data) => {
        setGroups(data);
        setSelectedGroup(null)
      });
    }
  }, [socket, setGroups, setSelectedGroup])

  const handleRemoveGroup = async (groupId) => {
    socket.emit('delete group', {groupId: groupId, serverId: selectedServer.id});
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
    >
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
        Groups
        {(selectedServer && myServers.some((s) => s.id === selectedServer.id)) &&
          <GroupChatModal>
            <Button
              className="add-group-btn"
              d="flex"
              colorScheme="dark"
              fontSize={{ base: "17px", md: "10px", lg: "17px" }}
              rightIcon={<AddIcon />}
            >
            </Button>
          </GroupChatModal>
        }
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
        {groups ? (
          <Stack overflowY="scroll">
            {groups.map((group) => {
              return <Box
                onClick={() => setSelectedGroup(group)}
                cursor="pointer"
                bg={selectedGroup === group ? "#707c8d" : "#4a5565"}
                color={selectedGroup === group ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={group.id}
                className="flex justify-between items-center !text-white !border-2 !border-gray-300"
              >
                <Text>
                  # {group.group_name}
                </Text>
                {
                  (selectedServer && myServers.some((s) => s.id === selectedServer.id)) &&
                  <ConfirmModal title="Confirm Removal" description="Are you sure you want to remove?" onConfirm={() => handleRemoveGroup(group.id)}>
                    <IconButton aria-label='Remove Group' colorScheme="dark" icon={<DeleteIcon />} />
                  </ConfirmModal>
                }
              </Box>
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
