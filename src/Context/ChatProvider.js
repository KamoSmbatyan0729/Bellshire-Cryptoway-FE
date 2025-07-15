import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { getContract } from "../Contract/contract";
import { useToast } from "@chakra-ui/react";
import useWallet from "./useWallet";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [selectedServer, setSelectedServer] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [myServers, setMyServers] = useState([]);
  const [joinedServers, setJoinedServers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState();
  const [selectContact, setSelectContact] = useState(false);
  const [contract, setContract] = useState();
  const [activated, setActivated] = useState(false);
  const toast = useToast();
  const connectedAccount = useWallet();

  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      const userInfoString = localStorage.getItem("userInfo");

      if (userInfoString && userInfoString !== 'undefined') {
        const userInfo = JSON.parse(userInfoString);
        setUser(userInfo);
      } else {
        history.push("/");
        return;
      }

      try {
        if(contract && connectedAccount.account){
          const isActivated  = await contract.checkIsActivated(connectedAccount.account);
          setActivated(isActivated);
        }
      } catch (err) {
        console.error("Failed to check activation:", err);
      }
    };

    fetchData();
  }, [history, contract, connectedAccount.account]);

  const callReadContract = useCallback(async () => {
    const contractInstance = getContract();

    if (!contractInstance) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask to interact with the blockchain.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setContract(contractInstance);
  }, [toast]);

  useEffect(() => {
    callReadContract();
  }, [callReadContract]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        myServers, 
        setMyServers,
        joinedServers,
        setJoinedServers,
        groups,
        setGroups,
        selectedServer,
        setSelectedServer,
        selectedGroup,
        setSelectedGroup,
        contacts,
        setContacts,
        selectedContact,
        setSelectedContact,
        selectContact,
        setSelectContact,
        contract,
        activated,
        setActivated,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
