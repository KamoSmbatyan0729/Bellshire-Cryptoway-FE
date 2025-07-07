import { SocketContext } from "./SocketContext";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_BACKEND_URL;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const history = useHistory();
  
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            history.push("/");
            return;
        }
        const token = userInfo?.token;

        if (token) {
            const newSocket = io(ENDPOINT, {
                auth: { token: token },
            });

            setSocket(newSocket);

            return () => newSocket.disconnect();
        }
            
    }, [history]);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
