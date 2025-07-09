import { Box, Button, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { connectWallet } from "../../api/connectWallet";
import useWallet from "../../Context/useWallet";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import { SocketContext } from "../../Context/SocketContext";
import io from "socket.io-client";
import {useContext} from "react";
const ENDPOINT = process.env.REACT_APP_BACKEND_URL;

export default function Header(){
    const [account, setAccount] = useState(null);
    const connectedAccount = useWallet();
    const toast = useToast();
    const history = useHistory();
    const { setUser } = ChatState();
        const { socket, setSocket } = useContext(SocketContext);

    useEffect(() => {
        setAccount(connectedAccount.account);
    }, [connectedAccount])

    const handleConnect = async () => {
        if(account){
            history.push("/chats");
        } else {
            try {
                const response = await connectWallet();
                setAccount(response.account);
                toast({
                    title: "Login Successful",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
                
                if(!socket) {
                    const newSocket = io(ENDPOINT, {
                        auth: { token: response.userData.token },
                    });
                    setSocket(newSocket);
                }
                setUser(response.userData);
                localStorage.setItem("userInfo", JSON.stringify(response.userData));
                history.push("/chats");
            } catch (err) {
                alert(err.message);
            }
        }
    };
    return (
        <Box className="h-20 px-10 flex justify-between items-center">
            <Image src="./assets/images/logo.svg" className="w-16 h-16"/>
            <Button onClick={handleConnect}>
                {account ? account.substring(0, 6) + "..." + account.slice(-4) : "Connect"}
            </Button>
        </Box>
    )
}