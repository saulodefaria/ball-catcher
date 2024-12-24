import { useEffect, useState, useRef } from "react";
import "./Boulders.css";

const WEBCAM_WIDTH = 1920;
const WEBCAM_HEIGHT = 1080;
// const WEBCAM_WIDTH = 640;
// const WEBCAM_HEIGHT = 480;
const BOULDER_SIZE = 30; // pixels

const Boulder = ({ x, y }) => {
  return (
    <div
      className="boulder"
      style={{
        left: x,
        top: y,
        width: BOULDER_SIZE,
        height: BOULDER_SIZE,
      }}
    />
  );
};

const DebugBox = ({ obj, color }) => (
  <div
    style={{
      position: "absolute",
      right: obj.x,
      top: obj.y,
      width: obj.width,
      height: obj.height,
      border: `2px solid ${color}`,
      pointerEvents: "none",
      opacity: 0.5,
    }}
  />
);

const Boulders = ({ handPositions, gameSettings, onScoreUpdate }) => {
  const [boulders, setBoulders] = useState([]);
  const [, setScore] = useState(0);

  // Update boulder spawning based on difficulty
  useEffect(() => {
    if (!gameSettings) return;

    const interval = setInterval(() => {
      setBoulders((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * (WEBCAM_WIDTH - BOULDER_SIZE - 40),
          y: 0,
        },
      ]);
    }, gameSettings.spawnInterval);

    return () => clearInterval(interval);
  }, [gameSettings]);

  // Update boulder movement based on difficulty
  useEffect(() => {
    if (!gameSettings) return;

    const timer = setInterval(() => {
      setBoulders((prev) =>
        prev
          .map((boulder) => ({ ...boulder, y: boulder.y + gameSettings.speed }))
          .filter((boulder) => boulder.y < WEBCAM_HEIGHT)
      );
    }, 30);

    return () => clearInterval(timer);
  }, [gameSettings]);

  // Update collision detection to increment score
  useEffect(() => {
    if (handPositions && handPositions.length > 0) {
      handPositions.forEach((hand) => {
        const handObj = {
          x: WEBCAM_WIDTH - (hand.x + hand.width),
          y: hand.y,
          width: hand.width,
          height: hand.height,
        };

        boulders.forEach((boulder) => {
          const boulderObj = {
            x: boulder.x,
            y: boulder.y,
            width: BOULDER_SIZE,
            height: BOULDER_SIZE,
          };

          if (checkCollision(handObj, boulderObj)) {
            setBoulders((prev) => prev.filter((b) => b.id !== boulder.id));
            setScore((prev) => {
              const newScore = prev + 1;
              onScoreUpdate(newScore);
              return newScore;
            });
          }
        });
      });
    }
  }, [handPositions, boulders, onScoreUpdate]);

  return (
    <>
      <div className="boulders-container">
        {boulders.map((boulder) => (
          <Boulder key={boulder.id} x={boulder.x} y={boulder.y} />
        ))}
        {process.env.NODE_ENV === "development" &&
          handPositions?.map((hand, i) => (
            <DebugBox
              key={i}
              obj={{
                x: hand.x,
                y: hand.y,
                width: hand.width,
                height: hand.height,
              }}
              color="red"
            />
          ))}
      </div>
    </>
  );
};

// Helper function to check collision between hand and boulder
const checkCollision = (hand, boulder) => {
  // Add some padding to make collision detection more forgiving
  const padding = 0;
  return (
    hand.x - padding < boulder.x + boulder.width &&
    hand.x + hand.width + padding > boulder.x &&
    hand.y - padding < boulder.y + boulder.height &&
    hand.y + hand.height + padding > boulder.y
  );
};

export default Boulders;
