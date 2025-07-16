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
  Text,
  Spinner
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { SocketContext } from "../../Context/SocketContext";
import {useContext, useEffect} from "react";
import { ethers } from 'ethers';
import approveTokens from "../../Contract/approve";

const ServerChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [joinFee, setJoinFee] = useState();
  const toast = useToast();
  const { socket } = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const [serverCreationFee, setServerCreationFee] = useState();

  const { user, setMyServers, setSelectedServer, contract, activated } = ChatState();
  const handleSubmit = async () => {
    if (!groupChatName || !joinFee) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if(!activated){
      toast({
        title: "Failed to Create the Server!",
        description: "You should activate your account first!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true)
      const creationFee = serverCreationFee / (10 ** 18);
      await approveTokens(process.env.REACT_APP_PROXY_CHANNEL_CONTRACT_ADDRESS, creationFee);   
      const tx = await contract.createPremiumChannel(
        ethers.utils.parseEther(creationFee.toString())
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (e) => e.event === "ChannelCreated"
      );

      const channelId = event.args.channelId;
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chat/server/create`,
        {
          serverName: groupChatName,
          channelId: channelId.toString()
        },
        config
      );
      setSelectedServer(data.server)
      setMyServers(prev => [...prev, data.server]);
      socket.emit("join server", data.server.id);
      setLoading(false)
      onClose();
      toast({
        title: "New Server Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      setLoading(false)
      toast({
        title: "Failed",
        description: "Failed to create a server",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    const fetchFee = async () => {
      try {
        setLoading(true);
        const result = await contract.getChannelCreationFee();
        setServerCreationFee(result.toString());
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchFee();
  }, [contract]);

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent className="!bg-gray-900 !text-white">
          {
            loading &&
            <div className="absolute bg-black w-full h-full opacity-70 z-[1000]">
              <div className="flex justify-center items-center h-full">
                <Spinner
                  thickness='4px'
                  speed='0.65s'
                  emptyColor='gray.200'
                  color='blue.500'
                  size='xl'
                />
              </div>
            </div>
          }
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
                type="number"
                placeholder="Join Fee"
                mb={3}
                onChange={(e) => setJoinFee(e.target.value)}
              />
              <Text>This is the amount users must pay to join your server(Bellshire token).</Text>
              <Text className="text-red-600 !mt-5">Server creation fee is {serverCreationFee / (10 ** 18)} Bellshire token.</Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="dark">
              Create Server
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ServerChatModal;
