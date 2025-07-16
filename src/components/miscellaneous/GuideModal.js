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
  Text
} from "@chakra-ui/react";

const GuideModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent className="!bg-gray-900 !text-white">
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            Guide
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column">
            <Text className="text-start mb-2">
              To use this chat system, you must first import the required token into your wallet.
            </Text>
            <Text className="text-start">
              You can import the token using this address:
              <br />
              <strong>{process.env.REACT_APP_PROXY_TOKEN_CONTRACT_ADDRESS}</strong>
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="dark">
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GuideModal;
