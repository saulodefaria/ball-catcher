import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import "./Boulders.css";

const SERVER_WEBCAM_WIDTH = import.meta.env.VITE_SERVER_WEBCAM_WIDTH;
const SERVER_WEBCAM_HEIGHT = import.meta.env.VITE_SERVER_WEBCAM_HEIGHT;

const BOULDER_SIZE = 50; // pixels

const BOULDER_COLORS = ["red", "blue", "green"];

const Boulder = ({ x, y }) => {
  const color = useMemo(() => BOULDER_COLORS[Math.floor(Math.random() * BOULDER_COLORS.length)], []);

  return (
    <div
      className="boulder"
      style={{
        left: x,
        top: y,
        width: BOULDER_SIZE,
        height: BOULDER_SIZE,
        backgroundImage: `url('/${color}.png')`,
        backgroundSize: "cover",
        backgroundColor: "transparent",
      }}
    />
  );
};

Boulder.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

const DebugBox = ({ obj, color }) => (
  <div
    style={{
      position: "absolute",
      left: obj.x,
      top: obj.y,
      width: obj.width,
      height: obj.height,
      border: `2px solid ${color}`,
      pointerEvents: "none",
      opacity: 0.5,
    }}
  />
);

DebugBox.propTypes = {
  obj: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  color: PropTypes.string.isRequired,
};

const Boulders = ({ handPositions, displaySize, gameSettings, onScoreUpdate }) => {
  const [boulders, setBoulders] = useState([]);
  const [, setScore] = useState(0);

  // Scale coordinates from server to display size
  // const scaleCoordinates = (coord, isWidth = true) => {
  //   return isWidth
  //     ? (coord * displaySize.width) / SERVER_WEBCAM_WIDTH
  //     : (coord * displaySize.height) / SERVER_WEBCAM_HEIGHT;
  // };
  const scaleCoordinates = (coord, isWidth = true) => {
    return coord;
  };

  // Handle boulder spawning and movement
  useEffect(() => {
    if (!gameSettings) return;

    // Spawn new boulders
    const spawnInterval = setInterval(() => {
      setBoulders((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * (displaySize.width - BOULDER_SIZE - 40),
          y: 0,
        },
      ]);
    }, gameSettings.spawnInterval);

    // Move existing boulders
    const moveInterval = setInterval(() => {
      setBoulders((prev) =>
        prev
          .map((boulder) => ({ ...boulder, y: boulder.y + gameSettings.speed }))
          .filter((boulder) => boulder.y < displaySize.height)
      );
    }, 30);

    // Cleanup both intervals
    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [gameSettings, displaySize]);

  // Update collision detection with scaled coordinates
  useEffect(() => {
    if (handPositions && handPositions.length > 0) {
      handPositions.forEach((hand) => {
        const handObj = {
          x: hand.x + hand.width / 2,
          y: hand.y - hand.height / 2,
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
  }, [handPositions, boulders, displaySize]);

  return (
    <div className="boulders-container">
      {boulders.map((boulder) => (
        <Boulder key={boulder.id} x={boulder.x} y={boulder.y} />
      ))}
      {import.meta.env.VITE_DEBUG === "true" &&
        handPositions?.map((hand, i) => (
          <DebugBox
            key={i}
            obj={{
              x: hand.x + hand.width / 2,
              y: hand.y - hand.height / 2,
              width: hand.width,
              height: hand.height,
            }}
            color="red"
          />
        ))}
    </div>
  );
};

Boulders.propTypes = {
  handPositions: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    })
  ).isRequired,
  displaySize: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  gameSettings: PropTypes.shape({
    spawnInterval: PropTypes.number.isRequired,
    speed: PropTypes.number.isRequired,
  }).isRequired,
  onScoreUpdate: PropTypes.func.isRequired,
};

// Helper function to check collision between hand and boulder
const checkCollision = (hand, boulder) => {
  return (
    hand.x < boulder.x + boulder.width &&
    hand.x + hand.width > boulder.x &&
    hand.y < boulder.y + boulder.height &&
    hand.y + hand.height > boulder.y
  );
};

export default Boulders;
