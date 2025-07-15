import { Box } from "@chakra-ui/layout";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";
import DirectChatBox from "./DirectChatBox";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, selectContact } = ChatState();

  return (
    <Box
      d={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="dark"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
    >
      {
        selectContact ? 
        <DirectChatBox/>
        :
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      }
    </Box>
  );
};

export default Chatbox;
