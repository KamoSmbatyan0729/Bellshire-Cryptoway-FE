import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import Landingpage from "./Pages/Landingpage";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Landingpage} exact />
      <Route path="/login" component={Homepage} />
      <Route path="/chats" component={Chatpage} />
    </div>
  );
}

export default App;
