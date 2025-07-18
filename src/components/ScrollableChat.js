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
import { FaRegFile } from "react-icons/fa";
import { DownloadIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
import axios from 'axios';
import { useContext, useState } from "react";
import { SocketContext } from "../Context/SocketContext";
import SendTipModal from "./miscellaneous/SendTipModal";


const BackendUrl = process.env.REACT_APP_BACKEND_URL;

const ScrollableDMChat = ({ messages, handleEdit, handleRemove }) => {
  const { user, contacts, setContacts, setSelectContact, setSelectedContact, setSelectedServer, setSelectedGroup } = ChatState();
    const { socket } = useContext(SocketContext);
    const [tipAddress, setTipAddress] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    function handleTipOpen(address) {
      setModalOpen(true)
      setTipAddress(address);
    }
    function handleTipClose() {
      setTipAddress(null);
      setModalOpen(false);
    }

  function handleClickAddress(address){
    navigator.clipboard.writeText(address);
  }
  async function handleDirectMessage(message) {
    const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.get(
        `/api/chat/dm/addContact/${message.sender_wallet}`,
        config
      );
      if(!response.data.exist) {
        setContacts([...contacts, response.data.result]);
      }
      socket.emit("join contact", {wallet_address: response.data.result.wallet_address, contact_wallet: response.data.result.contact_wallet})
      setSelectContact(true);
      setSelectedContact(response.data.result);
      setSelectedServer(null);
      setSelectedGroup(null)
  }
  return (
    <ScrollableFeed className="overflow-x-hidden">
      {messages &&
        messages.map((m) => {
          return <div key={m.id} className={(m.sender_wallet === user._id ? "justify-end" : "justify-start") + " flex"}>   
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
                <div
                  style={{
                    backgroundColor: `${
                      m.sender_wallet === user._id ? "#364153" : "#73829b"
                    }`,
                    borderRadius: "5px",
                    padding: "5px 30px 5px 15px",
                  }}
                >
                  {
                    m.attachment_url && (                      
                      <div className="flex items-center justify-between p-3 bg-[#e0e0e0] relative">
                        {m.attachment_url && (() => {
                          const attachmentUrls = JSON.parse(m.attachment_url); 
                          return attachmentUrls.map((file_info, index) => {
                            return <div className="flex items-center" key={index}>
                              <div className="rounded-lg p-10 flex justify-center items-center relative bg-gray-400 me-3">
                                <FaRegFile size={30} />
                                <a                                
                                    className="!absolute top-2 right-2"
                                    href={BackendUrl + "/files/" + file_info.url + "/" + file_info.originalName}
                                    download={file_info.originalName}
                                  >
                                  <IconButton
                                    size="xs"
                                    aria-label="Remove File"
                                    colorScheme="red"
                                    icon={<DownloadIcon size={10} />}
                                    // onClick={() => handleDownloadFile(file_info)} // pass correct file
                                  />
                                </a>
                                <p className="absolute bottom-2 left-2 text-xs">{file_info.originalName}</p>
                              </div>
                            </div>
                          });
                        })()}
                      </div>
                    )
                  }
                  {m.content}
                </div>
                {
                  m.sender_wallet === user._id ?                  
                  <div className="absolute top-0 right-0">
                    <Menu isLazy>
                      <MenuButton p={1}>
                        <HiDotsVertical />
                      </MenuButton>
                      <MenuList className="!bg-gray-500">
                        <MenuItem onClick={() => handleEdit(m)} _hover={{ bg: 'gray.600' }}>Edit</MenuItem>
                        <MenuItem onClick={() => handleRemove(m.id)} _hover={{ bg: 'gray.600' }}>Remove</MenuItem>
                      </MenuList>
                    </Menu>
                  </div>
                  :
                  <div className="absolute top-0 right-0">
                    <Menu isLazy>
                      <MenuButton p={1}>
                        <HiDotsVertical />
                      </MenuButton>
                      <MenuList className="!bg-gray-500">
                        <MenuItem onClick={() => handleClickAddress(m.sender_wallet)} _hover={{ bg: 'gray.600' }}>Copy Address</MenuItem>
                        <MenuItem onClick={() => handleDirectMessage(m)} _hover={{ bg: 'gray.600' }}>Direct Message</MenuItem>
                        <MenuItem onClick={() => handleTipOpen(m.sender_wallet)} _hover={{ bg: 'gray.600' }}>Send Tips</MenuItem>
                      </MenuList>
                    </Menu>
                  </div>
                }
              </div>
            </div>         
          </div>
        })}
        {modalOpen && (
          <SendTipModal isOpen={modalOpen} onClose={handleTipClose} address={tipAddress} />
        )}
    </ScrollableFeed>
  );
};

export default ScrollableDMChat;
