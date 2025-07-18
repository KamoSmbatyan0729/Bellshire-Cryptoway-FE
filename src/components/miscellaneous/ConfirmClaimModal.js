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
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";

const ConfirmClaimModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const { contract } = ChatState();

  const handleSubmit = async () => {

    try {
      setLoading(true)

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const user = accounts[0];
      
      await contract.methods.claimReward().send({ from: user, gas: 200000 });
      
      setLoading(false)
      onClose();
      toast({
        title: "You claimed",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      console.log(error.data.message)
      onClose();
      toast({
        title: "Failed to claim!",
        description: "Failed to claim!",
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
            Confirmation Claim
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column">
            <Text className="text-start">
              Are you sure you want to claim the rewards?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="dark">
              Claim
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmClaimModal;
