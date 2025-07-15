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
import approveTokens from "../../Contract/approve";

const ConfirmStakingModal = ({ children }) => {
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

    try {
      setLoading(true)   
      await approveTokens(process.env.REACT_APP_PROXY_USERS_CONTRACT_ADDRESS, stakingAmount);   
      const tx = await contract.stakeToAccount(ethers.utils.parseEther(stakingAmount));
      await tx.wait();
      await fetchStackedAmount();
      setLoading(false)
      onClose();
      toast({
        title: "You staked",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      console.log(error)
      onClose();
      toast({
        title: "Failed to stake!",
        description: "Failed to stake!",
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
      const result = await contract.getStackAmount();
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
            <FormControl>
              <Input
                type="number"
                placeholder="Stacking Amount"
                mb={3}
                onChange={(e) => setStakingAmount(e.target.value)}
              />
            </FormControl>
            <Text className="text-start">
              You staked {stackedAmount} hype
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="dark">
              Stake
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmStakingModal;
