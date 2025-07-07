import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import Landingpage from "./Pages/Landingpage";
import {SocketProvider} from "./Context/SocketProvider";

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <Route path="/" component={Landingpage} exact />
        <Route path="/login" component={Homepage} />
        <Route path="/chats" component={Chatpage} />
      </SocketProvider>
    </div>
  );
}

export default App;
