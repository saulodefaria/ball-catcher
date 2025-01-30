import { useEffect, useRef, useState } from "react";
import CameraFeed from "./components/CameraFeed";
import Boulders from "./components/Boulders";
import StartScreen from "./components/StartScreen";
// import io from "socket.io-client";
import "./App.css";

async function getPrediction(base64Frame) {
  const response = await fetch("http://104.248.123.197:9001/infer/workflows/saulofaria/hand-detection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: "AXmLt45wWU9lGWR4tHxl",
      inputs: {
        image: {
          type: "base64",
          value: base64Frame,
        },
      },
    }),
  });
  const predictionsData = await response.json();
  const predictions = predictionsData.outputs[0].model_all.predictions;
  // Mirror the x coordinates before returning
  return predictions.map((pred) => ({
    ...pred,
    x: 640 - (pred.x + pred.width), // Mirror x coordinate
  }));
}

function App() {
  const webcamRef = useRef(null);
  const [handPositions, setHandPositions] = useState([]);
  // const socketRef = useRef(null);
  const [displaySize, setDisplaySize] = useState(null);
  const [gameSettings, setGameSettings] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Don't start processing frames if displaySize is null
    if (!displaySize) return;

    const frameInterval = 1000 / 30; // 30 FPS
    let animationFrameId;
    let lastFrameTime = 0;

    const processFrame = async (timestamp) => {
      if (timestamp - lastFrameTime >= frameInterval) {
        const base64Frame = getFrameBase64();
        if (base64Frame) {
          const predictions = await getPrediction(base64Frame);
          const scaledPredictions = predictions.map((prediction) => ({
            x: (prediction.x * displaySize.width) / 640,
            y: (prediction.y * displaySize.height) / 480,
            width: (prediction.width * displaySize.width) / 640,
            height: (prediction.height * displaySize.height) / 480,
          }));
          // console.log("displaySize", displaySize);
          // console.log("predictions", predictions);
          // console.log("scaledPredictions", scaledPredictions);
          setHandPositions(scaledPredictions);
        }
        lastFrameTime = timestamp;
      }
      animationFrameId = requestAnimationFrame(processFrame);
    };

    animationFrameId = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [displaySize]);

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

  const getFrameBase64 = () => {
    if (!webcamRef.current) return null;

    // Get the actual video element from the Webcam component
    const video = webcamRef.current.video;
    if (!video) return null;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 640;
    tempCanvas.height = 480;

    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return null;

    // Draw from the video element instead of the ref directly
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    // Get base64 string (removing the data:image/png;base64, prefix)
    const base64String = tempCanvas.toDataURL("image/jpeg", 0.8).split(",")[1];
    return base64String;
  };

  return (
    <div className="App">
      <div className="game-container">
        <CameraFeed ref={webcamRef} onDisplaySize={handleDisplaySize} displaySize={displaySize} />
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
