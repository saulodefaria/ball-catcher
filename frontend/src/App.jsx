import { useEffect, useMemo, useRef, useState } from "react";
import CameraFeed from "./components/CameraFeed";
import Boulders from "./components/Boulders";
import StartScreen from "./components/StartScreen";
import io from "socket.io-client";
import { InferenceEngine, CVImage } from "inferencejs";

import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const [handPositions, setHandPositions] = useState([]); // array with x, y, width, height, confidence
  const socketRef = useRef(null);
  const [displaySize, setDisplaySize] = useState(null);
  const [gameSettings, setGameSettings] = useState(null);
  const [score, setScore] = useState(0);

  const inferEngine = useMemo(() => {
    return new InferenceEngine();
  }, []);

  const [modelWorkerId, setModelWorkerId] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);

  useEffect(() => {
    if (!modelLoading) {
      setModelLoading(true);
      inferEngine
        .startWorker("distress-detection-a0xh3", 3, "rf_EsVTlbAbaZPLmAFuQwWoJgFpMU82")
        .then((id) => setModelWorkerId(id));
    }
  }, [inferEngine, modelLoading]);

  useEffect(() => {
    console.log("Model Worker ID: " + modelWorkerId);
    if (modelWorkerId) {
      console.log("Skipping Webcam");
      // startWebcam();
      console.log("Detecting frame");
      detectFrame();
    }
  }, [modelWorkerId]);

  const detectFrame = () => {
    if (!modelWorkerId || !webcamRef.current?.video) {
      setTimeout(detectFrame, 1000 / 60);
      return;
    }

    try {
      const img = new CVImage(webcamRef.current.video);
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      inferEngine
        .infer(modelWorkerId, img)
        .then((predictions) => {
          const handPositions = predictions.map((prediction) => {
            // Mirror the x coordinate calculation like in page.tsx
            const x = videoWidth - (prediction.bbox.x + prediction.bbox.width / 2);
            const y = prediction.bbox.y - prediction.bbox.height / 2;

            return {
              x: x,
              y: y,
              width: prediction.bbox.width,
              height: prediction.bbox.height,
              confidence: prediction.confidence,
              originalWidth: videoWidth,
              originalHeight: videoHeight,
            };
          });
          setHandPositions(handPositions);
        })
        .catch((error) => {
          console.error("Inference error:", error);
        });
    } catch (error) {
      console.error("CVImage creation error:", error);
    }

    setTimeout(detectFrame, 1000 / 60); // 60 FPS
  };

  // Connect to the WebSocket server
  // useEffect(() => {
  //   console.log("Attempting to connect to WebSocket server...");
  //   socketRef.current = io("http://localhost:6789", {
  //     transports: ["websocket"],
  //     reconnection: true,
  //   });

  //   socketRef.current.on("connect", () => {
  //     console.log("Connected to WebSocket server", socketRef.current.id);
  //   });

  //   socketRef.current.on("connect_error", (error) => {
  //     console.error("Connection error:", error);
  //   });

  //   socketRef.current.on("disconnect", (reason) => {
  //     console.log("Disconnected from WebSocket server. Reason:", reason);
  //   });

  //   // Listen for hand position data
  //   socketRef.current.on("handPosition", (data) => {
  //     data = data.filter((hand) => hand.confidence > 0.75); // Filter out low confidence hand positions
  //     setHandPositions(data);
  //   });

  //   return () => {
  //     if (socketRef.current) {
  //       console.log("Cleaning up socket connection");
  //       socketRef.current.disconnect();
  //     }
  //   };
  // }, []);

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
