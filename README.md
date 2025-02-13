# Ball Catcher App

An interactive game that uses computer vision to detect hand movements and catch falling balls, powered by [Roboflow](https://roboflow.com).

## Demo

[Click here for a quick video of the app in action.](https://www.loom.com/share/5c671dc3b76e4635993fa2c646c3714e?sid=92dc6f47-d609-42dc-a60b-88907a4cbead)

## Prerequisites

- Python 3.12
- Node.js 18 or higher
- npm 9 or higher
- Have a workflow in Roboflow (you can fork [the one I created here](https://app.roboflow.com/workflows/embed/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3b3JrZmxvd0lkIjoiVkVYbGZXNXRXNk02ZmtjRU40NVEiLCJ3b3Jrc3BhY2VJZCI6IkJDV3ZsODBCTzVaYkVQUnI0OXlmb3hiU0xESTIiLCJ1c2VySWQiOiJCQ1d2bDgwQk81WmJFUFJyNDl5Zm94YlNMREkyIiwiaWF0IjoxNzM1MDYzMjIxfQ.t8Oa29CXZ9Ct1toChuO4ZwaHPNEDhG_NoB5HFItiZ5I))

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/saulodefaria/ball-catcher.git
   cd ball-catcher
   ```

2. Set up the Python backend:

   ```bash
   # Create and activate virtual environment
   python -m venv workflow/.venv
   source workflow/.venv/bin/activate
   # On Windows: workflow\.venv\Scripts\activate

   # Install Python dependencies
   pip install -r workflow/requirements.txt

   # Configure environment variables
   cp workflow/.env.example workflow/.env
   # Edit workflow/.env with your actual values
   ```

3. Set up the React frontend:
   ```bash
   cd frontend
   npm install
   ```

## Environment Variables

Create a `.env` file in each of the following directories:

### workflow

- `API_KEY` - Your API key for the computer vision service
- `WORKSPACE_NAME` - Your Roboflow workspace name
- `WORKFLOW_ID` - Your Roboflow workflow ID
- `FRAME_WIDTH` - Webcam frame width (default: 1920)
- `FRAME_HEIGHT` - Webcam frame height (default: 1080)

### frontend

- `VITE_SERVER_WEBCAM_WIDTH` - Server webcam width (should match workflow)
- `VITE_SERVER_WEBCAM_HEIGHT` - Server webcam height (should match workflow)
- `VITE_DEBUG` - Whether to enable debug mode: add a red border to the detected hand (default: false)

## Running the Application

1. Start the Python backend server:

   ```bash
   # From the root directory, with virtual environment activated
   cd workflow
   python server.py
   ```

2. In a new terminal, start the React frontend:

   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Development

- Backend server runs on port 6789
- Frontend development server runs on port 5173
- Make sure your webcam is accessible
