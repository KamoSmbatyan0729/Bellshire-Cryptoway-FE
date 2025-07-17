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
import { useState, useEffect, useCallback } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { ethers } from 'ethers';

const ConfirmUnstakingModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [stakingAmount, setStakingAmount] = useState();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [stackedAmount, setStackedAmount] = useState(0);

  const { contract } = ChatState();

  const handleSubmit = async () => {
    if (!stakingAmount) {
      toast({
        title: "Please fill stacking amount",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (stakingAmount <= 0) {
      toast({
        title: "Please stack first to unstack!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true)

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const sender = accounts[0];

      const tx = await contract.methods.unstakeFromAccount(ethers.utils.parseEther(stakingAmount.toString())).send({ from: sender, gas: 200000 });
      //await tx.wait();
      await fetchStackedAmount();
      setLoading(false)
      onClose();
      toast({
        title: "You unstaked",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      onClose();
      toast({
        title: "Failed to unstake!",
        description: error.data.message || "Failed to unstake!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const fetchStackedAmount = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const userAddress = accounts[0];

      const result = await contract.methods.getStackAmount().call({ from: userAddress });
      setStackedAmount(ethers.utils.formatEther(result));
    } catch (err) {
      console.error("Failed to fetch staked amount:", err);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (isOpen) {
      fetchStackedAmount();
    }
  }, [isOpen, fetchStackedAmount]);

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
            Confirmation Stacking
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column">
            <FormControl>
              <Input
                type="number"
                placeholder="Stacking Amount"
                mb={3}
                onChange={(e) => setStakingAmount(e.target.value)}
              />
            </FormControl>
            <Text className="text-start">
              You staked {stackedAmount} Bellshire token
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="dark">
              Unstake
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmUnstakingModal;
