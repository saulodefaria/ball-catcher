import "./StartScreen.css";

const DIFFICULTY_SETTINGS = {
  easy: { spawnInterval: 1000, speed: 3, color: "#4CAF50" }, // Green
  medium: { spawnInterval: 500, speed: 5, color: "#2196F3" }, // Blue
  hard: { spawnInterval: 300, speed: 7, color: "#FF9800" }, // Orange
  extreme: { spawnInterval: 200, speed: 10, color: "#f44336" }, // Red
};

const StartScreen = ({ onStart }) => {
  return (
    <div className="start-screen">
      <h1>Boulder Crash</h1>
      <div className="difficulty-select">
        <h2>Select Difficulty</h2>
        <div className="difficulty-buttons">
          {Object.entries(DIFFICULTY_SETTINGS).map(([level, settings]) => (
            <button
              key={level}
              onClick={() => onStart(settings)}
              className="difficulty-button"
              style={{
                backgroundColor: settings.color,
              }}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
