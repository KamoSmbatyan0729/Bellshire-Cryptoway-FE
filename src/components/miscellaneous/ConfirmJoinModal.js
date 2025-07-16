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
  useToast,
  Spinner,
  Text
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { ethers } from 'ethers';
import { SocketContext } from "../../Context/SocketContext";
import {useContext} from "react";
import axios from "../../api/axiosInstance";
import approveTokens from "../../Contract/approve";

const ConfirmJoinModal = ({ children, server }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [joinFee, setJoinFee] = useState(0);

  const { contract, user, setSelectedServer, setJoinedServers, activated } = ChatState();
const { socket } = useContext(SocketContext);

  const handleSubmit = async () => {
    try {
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
        await approveTokens(process.env.REACT_APP_PROXY_CHANNEL_CONTRACT_ADDRESS, joinFee);   
        const tx = await contract.joinPremiumChannel(server.channel_id);
        await tx.wait();
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(`/api/chat/server/join`, { serverId: server.id }, config);
  
        setSelectedServer(data.server)
        setJoinedServers(prev => [...prev, data.server]);
        socket.emit("join server", data.server.id);
        onClose();
      } catch (error) {
        toast({
          title: "Error Joining the server",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
    }
  };

  const fetchJoinFee = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const result = await contract.getChannelPrice(server.channel_id);
      setJoinFee(ethers.utils.formatEther(result));
    } catch (err) {
      console.error("Failed to fetch staked amount:", err);
    } finally {
      setLoading(false);
    }
  }, [contract, server.channel_id]);

  useEffect(() => {
    if (isOpen) {
      fetchJoinFee();
    }
  }, [isOpen, fetchJoinFee]);

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent  className="!bg-gray-900 !text-white">
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
            Confirmation Stacking
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column">
            <Text className="text-start">
              You need to pay {joinFee} Bellshire token to join this server
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="dark">
              Join Server
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmJoinModal;
