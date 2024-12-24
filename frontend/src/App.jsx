import { useEffect, useRef, useState } from "react";
import CameraFeed from "./components/CameraFeed";
import Boulders from "./components/Boulders";
import StartScreen from "./components/StartScreen";
import io from "socket.io-client";
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const [handPositions, setHandPositions] = useState([]);
  const socketRef = useRef(null);
  const [displaySize, setDisplaySize] = useState(null);
  const [gameSettings, setGameSettings] = useState(null);
  const [score, setScore] = useState(0);

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

  const handleStart = (settings) => {
    setGameSettings(settings);
    setScore(0);
  };

  const handleExit = () => {
    setGameSettings(null);
  };

  const handleDisplaySize = (size) => {
    setDisplaySize(size);
  };

  return (
    <div className="App">
      <div className="game-container">
        <CameraFeed ref={webcamRef} onDisplaySize={handleDisplaySize} />
        {gameSettings && displaySize ? (
          <>
            <Boulders
              handPositions={handPositions}
              displaySize={displaySize}
              gameSettings={gameSettings}
              onScoreUpdate={setScore}
            />
            <button className="exit-button" onClick={handleExit}>
              Exit
            </button>
            <div className="score">Score: {score}</div>
          </>
        ) : (
          <StartScreen onStart={handleStart} />
        )}
      </div>
    </div>
  );
}

export default App;
