import { Button, IconButton } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon, LinkIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { ChatState } from "../../Context/ChatProvider";
import ConfirmModal from "./ConfirmModal";
import ConfirmStakingModal from "./ConfirmStakingModal";
import ConfirmUnstakingModal from "./ConfirmUnstakingModal";
import ConfirmClaimModal from "./ConfirmClaimModal";
import ConfirmJoinModal from "./ConfirmJoinModal";
import approveTokens from "../../Contract/approve";
import { ethers } from 'ethers';

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    joinedServers,
    contract,
    activated,
    setActivated
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/chat/server/search?query=${search}`, config);

      setLoading(false);
      setSearchResult(data.servers);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  async function handleActivate() {
    try {
      await approveTokens(process.env.REACT_APP_PROXY_USERS_CONTRACT_ADDRESS, 1);

      const tx = await contract.activateAccount(ethers.utils.parseEther("1"));

      toast({
        title: "Processing...",
        description: "Waiting for transaction confirmation...",
        status: "info",
        duration: 4000,
        isClosable: true,
        position: "bottom-left",
      });

      await tx.wait();
      setActivated(true);
      toast({
        title: "Success",
        description: "Your account has been activated!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: error.message || "Activation failed.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }

  return (
    <>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        p="5px 10px 5px 10px"
        className="!bg-gray-600 text-white"
      >
        <Tooltip label="Search Servers to join" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text d={{ base: "none", md: "flex" }} px={4}>
              Search Server
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Bellshire
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2} className="!bg-gray-500">
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {`New Message from ${notif.sender_wallet}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="dark" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList className="!bg-gray-500">
              {
                !activated &&                
                <ConfirmModal
                  title="Confirm Activation"
                  description={
                    <>
                      Are you sure you want to activate your account?
                      <br />
                      You need to pay 0.1 HYPE to activate your account.
                    </>
                  }
                  onConfirm={handleActivate}
                >
                  <span>
                    <MenuItem _hover={{ bg: 'gray.600' }}>Activate</MenuItem>
                  </span>
                </ConfirmModal>
              }
              {
                activated &&
                <ConfirmStakingModal>
                  <MenuItem _hover={{ bg: 'gray.600' }}>Staking</MenuItem>
                </ConfirmStakingModal>
              }
              {
                activated &&
                <ConfirmUnstakingModal>
                  <MenuItem _hover={{ bg: 'gray.600' }}>Unstaking</MenuItem>
                </ConfirmUnstakingModal>
              }
              {
                activated &&
                <ConfirmClaimModal>
                  <MenuItem _hover={{ bg: 'gray.600' }}>Claim</MenuItem>
                </ConfirmClaimModal>
              }

              <MenuItem onClick={logoutHandler} _hover={{ bg: 'gray.600' }}>Logout</MenuItem>
            </MenuList>

          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent className="!bg-gray-500 !text-white">
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch} bg="dark">Go</Button>
            </Box>
            {loading ? (
                <ChatLoading />
              ) : (
                searchResult?.map((server) => {
                  if (!joinedServers.some((s) => s.id === server.id)) {
                    return (
                      <Box
                        key={server.id}
                        cursor="pointer"
                        bg="#E8E8E8"
                        _hover={{
                          background: "#38B2AC",
                          color: "white",
                        }}
                        w="100%"
                        d="flex"
                        alignItems="center"
                        color="black"
                        px={3}
                        py={2}
                        mb={2}
                        borderRadius="lg"
                        className="flex justify-between items-center"
                      >
                        <Box>
                          <Text>{server.server_name}</Text>
                        </Box>
                        <ConfirmJoinModal
                          server={server}
                        >
                          <IconButton aria-label="Join Server" colorScheme="red" icon={<LinkIcon />} />
                        </ConfirmJoinModal>
                      </Box>
                    );
                  }
                  return null;
                })
              )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
