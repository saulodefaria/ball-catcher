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

const Boulders = ({ handPositions }) => {
  const [boulders, setBoulders] = useState([]);

  // Add boulders to the screen
  useEffect(() => {
    const interval = setInterval(() => {
      setBoulders((prev) => [
        ...prev,
        {
          id: Date.now(),
          // x: WEBCAM_WIDTH - BOULDER_SIZE - 40,
          // x: 0,
          x: Math.random() * (WEBCAM_WIDTH - BOULDER_SIZE - 40),
          y: 0,
        },
      ]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Move boulders down the screen
  useEffect(() => {
    const timer = setInterval(() => {
      setBoulders((prev) =>
        prev.map((boulder) => ({ ...boulder, y: boulder.y + 5 })).filter((boulder) => boulder.y < WEBCAM_HEIGHT)
      );
    }, 30);

    return () => clearInterval(timer);
  }, []);

  // Check for collisions
  useEffect(() => {
    if (handPositions && handPositions.length > 0) {
      handPositions.forEach((hand) => {
        const handObj = {
          x: WEBCAM_WIDTH - (hand.x + hand.width),
          y: hand.y,
          width: hand.width,
          height: hand.height,
        };
        console.log("Hand:", handObj);

        boulders.forEach((boulder) => {
          const boulderObj = {
            x: boulder.x,
            y: boulder.y,
            width: BOULDER_SIZE,
            height: BOULDER_SIZE,
          };

          if (checkCollision(handObj, boulderObj)) {
            setBoulders((prev) => prev.filter((b) => b.id !== boulder.id));
          }
        });
      });
    }
  }, [handPositions, boulders]);

  return (
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
