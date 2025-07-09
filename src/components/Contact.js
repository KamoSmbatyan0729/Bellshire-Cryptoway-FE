import { DeleteIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect } from "react";
import { ChatState } from "../Context/ChatProvider";
import ConfirmModal from "./miscellaneous/ConfirmModal";
import { IconButton } from "@chakra-ui/react";
import { SocketContext } from "../Context/SocketContext";
import {useContext} from "react";

const Contact = ({ fetchAgain }) => {

  const { user, setContacts, contacts, selectContact, selectedContact, setSelectedContact } = ChatState();
  const { socket } = useContext(SocketContext);

  const toast = useToast();

    // eslint-disable-next-line
  const fetchContacts = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.get(`/api/chat/dm/getContacts/`, config);
      setContacts(response.data.result);
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
    if(selectContact) fetchContacts();
    // eslint-disable-next-line
  }, [selectContact]);

  useEffect(() => {
    if(socket){
      socket.on('delete contact', (data) => {
        console.log(data)
        setContacts(data);
        setSelectedContact(null)
      });
    }
  }, [socket, setContacts, setSelectedContact])

  const handleRemoveContact = async (contact) => {
    socket.emit('delete contact', {contact: contact});
  }
  function handleClickContact(contact) {
    setSelectedContact(contact)
    socket.emit("join contact", {wallet_address: contact.wallet_address, contact_wallet: contact.contact_wallet});
  }
  return (
    <Box
      d={{ base: selectContact ? "none" : "flex", md: "flex" }}
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
        Contacts
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
        {contacts.length > 0 && (
          <Stack overflowY="scroll">
            {contacts.map((contact) => {
            const contactName = contact.wallet_address === user._id ? contact.contact_wallet : contact.wallet_address;
                const contactKey = contact.wallet_address + contact.contact_wallet;
                const selectedKey = selectedContact?.wallet_address + selectedContact?.contact_wallet;
              return <Box
                onClick={() => handleClickContact(contact)}
                cursor="pointer"
                bg={contactKey === selectedKey ? "#38B2AC" : "#E8E8E8"}
                color={contactKey === selectedKey ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={contact.wallet_address + contact.contact_wallet}
                className="flex justify-between items-center"
              >
                <Text>
                  {contactName.substring(0, 6) + "..." + contactName.slice(-4)}
                </Text>
                <ConfirmModal title="Confirm Removal" description="Are you sure you want to remove?" onConfirm={() => handleRemoveContact(contact)}>
                    <IconButton aria-label='Remove Group' colorScheme="red" icon={<DeleteIcon />} />
                </ConfirmModal>
              </Box>
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Contact;
