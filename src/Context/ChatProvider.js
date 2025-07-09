import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

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

  const history = useHistory();

  useEffect(() => {
    const userInfoString = localStorage.getItem("userInfo");
    if (userInfoString && userInfoString !== 'undefined') {
      const userInfo = JSON.parse(userInfoString);
      setUser(userInfo);
    } else {
      history.push("/");
    }
  }, [history]);

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
        setSelectContact
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
