import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { Text } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { HiDotsVertical } from "react-icons/hi";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";

const ScrollableChat = ({ messages, handleEdit, handleRemove }) => {
  const { user } = ChatState();
  function handleClickAddress(address){
    navigator.clipboard.writeText(address);
  }
  return (
    <ScrollableFeed className="overflow-x-hidden">
      {messages &&
        messages.map((m, i) => (
          <div key={m.message_id} className={(m.sender_wallet === user._id ? "justify-end" : "justify-start") + " flex"}>   
            <div className="my-2">
              {
                m.sender_wallet !== user._id &&                
                <Tooltip label={m.sender_wallet} placement="bottom-start" hasArrow>
                  <Text className="cursor-pointer !my-1" onClick={() => handleClickAddress(m.sender_wallet)}>
                    {m.sender_wallet.substring(0, 6) + "..." + m.sender_wallet.slice(-4)}
                  </Text>
                </Tooltip>
              }
              <div className="relative">
                <span
                  style={{
                    backgroundColor: `${
                      m.sender_wallet === user._id ? "#BEE3F8" : "#B9F5D0"
                    }`,
                    borderRadius: "5px",
                    padding: "5px 30px 5px 15px",
                    maxWidth: "75%",
                  }}
                >
                  {m.content}
                </span>
                {
                  m.sender_wallet === user._id &&                  
                  <div className="absolute top-0 right-0">
                    <Menu isLazy>
                      <MenuButton p={1}>
                        <HiDotsVertical />
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => handleEdit(m)}>Edit</MenuItem>
                        <MenuItem onClick={() => handleRemove(m.message_id)}>Remove</MenuItem>
                      </MenuList>
                    </Menu>
                  </div>
                }
              </div>
            </div>         
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
