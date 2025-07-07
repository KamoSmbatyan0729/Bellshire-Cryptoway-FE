import { Box, Button, Container, Grid, Image } from "@chakra-ui/react";
import LandingLayout from "./Layout/LandingLayout";
import { ChatIcon } from "@chakra-ui/icons";
import { connectWallet } from "../api/connectWallet";
import { useEffect, useState } from "react";
import useWallet from "../Context/useWallet";
import { useHistory } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import { SocketContext } from "../Context/SocketContext";
import io from "socket.io-client";
import {useContext} from "react";
const ENDPOINT = process.env.REACT_APP_BACKEND_URL;

const advantageTexts = [
    "Chat with your wallet address.",
    "You can chat in groups.",
    "Perfect as a business tool.",
    "Distribute tokens all at once.",
    "There's a voting feature available.",
    "You can easily send tokens, too.",
];

const recommendServices = [
    "BrunToEarn",
    "Token Generator",
    "List a token",
];

export default function Landingpage() {
    const [account, setAccount] = useState(null);
    const connectedAccount = useWallet();
    const history = useHistory();
    const toast = useToast();
    const { setUser } = ChatState();
    const { socket, setSocket } = useContext(SocketContext);

    useEffect(() => {
        setAccount(connectedAccount.account);
    }, [connectedAccount])
    
    const handleConnect = async () => {
        if(account){
            const config = {
                headers: {
                "Content-type": "application/json",
                },
            };

            const { data } = await axios.post(
                "/api/user/login",
                { wallet_address: account},
                config
            );
            if(!socket) {
                const newSocket = io(ENDPOINT, {
                    auth: { token: data.token },
                });
                setSocket(newSocket);
            }
            localStorage.setItem("userInfo", JSON.stringify(data));
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
                setUser(response.userData);
                localStorage.setItem("userInfo", JSON.stringify(response.userData));
                history.push("/chats");
            } catch (err) {
                // alert(err.message);
            }
        }
    };
    return (
        <LandingLayout>
            <Box className="h-full p-10">
                <Container maxW={"5xl"}>
                    <Image src="./assets/images/logo.svg" className="block mx-auto w-20"/>
                    <p className="text-center !my-20">Bellshire Chat System</p>
                    <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}  gap="6">
                        {
                            advantageTexts.map((text, index) => {
                                return (
                                    <Box className="py-5 bg-white text-center" key={index}>
                                        {text}
                                    </Box>
                                )
                            })
                        }
                    </Grid>
                    <p className="text-center !my-5">Recommended Service</p>
                    <Box className="flex justify-center">
                        <Box className="bg-white sm:flex block rounded-sm p-2 gap-3">
                            {
                                recommendServices.map((service, index) => {
                                    return (
                                        <Box key={index} className="bg-[#e2e8f0] py-3 px-5 rounded-sm cursor-pointer md:my-0 my-2 text-center">
                                            {service}
                                        </Box>
                                    )
                                })
                            }
                        </Box>
                    </Box>
                    <Box className="flex justify-center mt-10">
                        <Button onClick={handleConnect} className="block mx-auto !rounded-2xl !px-5" leftIcon={<ChatIcon />} colorScheme='red' variant='solid'>
                            Start a Chat
                        </Button>
                    </Box>
                </Container>
            </Box>
        </LandingLayout>
    )
}