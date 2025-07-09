import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Text
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { SocketContext } from "../../Context/SocketContext";
import {useContext} from "react";
import contract from "../../Contract/contract";

const ServerChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const toast = useToast();
  const { socket } = useContext(SocketContext);
  const [serverCreationFee, setServerCreationFee] = useState(null);

  const { user, setMyServers, setSelectedServer } = ChatState();

  const callReadServerCreationFee = async () => {
    try {
      const result = await contract.owner();
      console.log(result)
      setServerCreationFee(result.toString());
    } catch (error) {
      console.error("Read error:", error);
    }
  };

  useEffect(() => {
    callReadServerCreationFee()
  }, [])

  const handleSubmit = async () => {
    if (!groupChatName) {
      toast({
        title: "Please fill server name",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chat/server/create`,
        {
          serverName: groupChatName,
        },
        config
      );
      setSelectedServer(data.server)
      setMyServers(prev => [...prev, data.server]);
      socket.emit("join server", data.server.id);
      onClose();
      toast({
        title: "New Server Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            Create Server
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Join Fee"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Text>Server creation fee is 1 hype</Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue">
              Create Server
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ServerChatModal;
