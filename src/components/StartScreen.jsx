import "./StartScreen.css";

const DIFFICULTY_SETTINGS = {
  easy: { spawnInterval: 1000, speed: 3 },
  medium: { spawnInterval: 500, speed: 5 },
  hard: { spawnInterval: 300, speed: 7 },
  extreme: { spawnInterval: 200, speed: 10 },
};

const StartScreen = ({ onStart }) => {
  return (
    <div className="start-screen">
      <h1>Boulder Crash</h1>
      <div className="difficulty-select">
        <label htmlFor="difficulty">Select Difficulty:</label>
        <select id="difficulty" onChange={(e) => onStart(DIFFICULTY_SETTINGS[e.target.value])}>
          <option value="">Choose difficulty...</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="extreme">Extreme</option>
        </select>
      </div>
    </div>
  );
};

export default StartScreen;
