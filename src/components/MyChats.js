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

const MyChats = ({ fetchAgain }) => {

  const { selectedGroup, setSelectedGroup, user, selectedServer, setGroups, groups, myServers } = ChatState();

  const toast = useToast();

    // eslint-disable-next-line
  const fetchGroups = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/chat/group/get-groups/${selectedServer.server_id}`, config);
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

  const handleRemoveGroup = async (groupId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/chat/server/get-servers", config);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Remove Server",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }

  return (
    <Box
      d={{ base: selectedServer ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
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
        {(selectedServer && myServers.some((s) => s.server_id === selectedServer.server_id)) &&
          <GroupChatModal>
            <Button
              className="add-group-btn"
              d="flex"
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
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {groups ? (
          <Stack overflowY="scroll">
            {groups.map((group) => (
              <Box
                onClick={() => setSelectedGroup(group)}
                cursor="pointer"
                bg={selectedGroup === group ? "#38B2AC" : "#E8E8E8"}
                color={selectedGroup === group ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={group.group_id}
                className="flex justify-between items-center"
              >
                <Text>
                  {group.group_name}
                </Text>
                {
                  myServers.some((s) => s.server_id === selectedServer.server_id) &&
                  <ConfirmModal title="Confirm Removal" description="Are you sure you want to remove?" onConfirm={() => handleRemoveGroup(group.group_name)}>
                    <IconButton aria-label='Remove Group' colorScheme="red" icon={<DeleteIcon />} />
                  </ConfirmModal>
                }
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
