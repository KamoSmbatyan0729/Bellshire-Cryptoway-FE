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
} from "@chakra-ui/react";

const ConfirmModal = ({ title, description, onConfirm, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleConfirm = async () => {
    onConfirm();
    onClose();
  };

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
            {title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center" className="text-center">
            {description}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleConfirm} colorScheme="dark">
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmModal;
