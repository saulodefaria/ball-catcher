import { useEffect, useRef, useState } from "react";
import CameraFeed from "./components/CameraFeed";
import Boulders from "./components/Boulders";
import io from "socket.io-client";
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const [handPositions, setHandPositions] = useState([]);
  const socketRef = useRef(null);
  const [videoSettings, setVideoSettings] = useState(null);

  useEffect(() => {
    console.log("Attempting to connect to WebSocket server...");
    socketRef.current = io("http://localhost:6789", {
      transports: ["websocket"],
      reconnection: true,
      // reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket server", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socketRef.current.on("handPosition", (data) => {
      data = data.filter((hand) => hand.confidence > 0.75);
      setHandPositions(data);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket server. Reason:", reason);
    });

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="game-container">
        <CameraFeed ref={webcamRef} onVideoSettings={setVideoSettings} />
        <Boulders handPositions={handPositions} videoSettings={videoSettings} />
      </div>
      {/* Add score or other UI elements here */}
    </div>
  );
}

export default App;
