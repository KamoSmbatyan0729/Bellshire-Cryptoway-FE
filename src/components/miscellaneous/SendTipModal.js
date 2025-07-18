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
  Spinner,
  Text
} from "@chakra-ui/react";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { ethers } from 'ethers';
import approveTokens from "../../Contract/approve";

const SendTipModal = ({ isOpen, onClose, address }) => {
  const [tipAmount, setTipAmount] = useState();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const { contract } = ChatState();

  const handleSubmit = async () => {
    if (!tipAmount) {
      toast({
        title: "Please fill tip amount",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true)
      await approveTokens(process.env.REACT_APP_PROXY_TIPPING_CONTRACT_ADDRESS, tipAmount);

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const sender = accounts[0];

      console.log("sender ", sender);
      console.log("stakingAmount ", tipAmount);

      await contract.methods.tipUser(address, ethers.utils.parseEther(tipAmount)).send({ from: sender, gas: 300000 });
      //await tx.wait();
      setLoading(false)
      onClose();
      toast({
        title: "You sent tips",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      console.log(error)
      onClose();
      toast({
        title: "Failed to send tip!",
        description: "Failed to tips!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
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
            Confirmation Stacking
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column">
            <FormControl>
              <Input
                type="number"
                placeholder="Stacking Amount"
                mb={3}
                onChange={(e) => setTipAmount(e.target.value)}
              />
            </FormControl>
            <Text className="text-start">
              Are you sure to want to send the tips to {address}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="dark">
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SendTipModal;
