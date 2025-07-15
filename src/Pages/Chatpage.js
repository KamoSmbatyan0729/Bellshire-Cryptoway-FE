import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import Servers from "../components/Servers";
import Contact from "../components/Contact";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, selectContact } = ChatState();
  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box d="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px" className="!bg-gray-700 text-white !h-[calc(100vh-50px)]">
        {user && <Servers fetchAgain={fetchAgain} />}
        {user && 
          (
            selectContact ? 
            <Contact/>
            :
            <MyChats fetchAgain={fetchAgain} />
          )
        }
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
