import asyncio
import socketio
from inference import InferencePipeline
import queue
import logging
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Queue to handle hand position data
# Acts as a thread-safe buffer between the video processing and Socket.IO communication
hand_positions_queue = queue.Queue()

# Initialize Socket.IO server
# Uses ASGI (Asynchronous Server Gateway Interface) mode for better performance
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode='asgi')
app = socketio.ASGIApp(sio)

# Function to send hand positions to all connected clients
async def send_hand_positions(hand_positions):
    await sio.emit('handPosition', hand_positions)

# Background handler to send hand positions to all connected clients
async def background_handler():
    logger.info("Background handler started")
    while True:
        await asyncio.sleep(0.02)  # check 50 times per second (50 FPS)
        if not hand_positions_queue.empty():
            positions = hand_positions_queue.get()
            logger.debug(f"Emitting hand positions: {positions}")
            try:
                await send_hand_positions(positions)
            except Exception as e:
                logger.error(f"Error emitting hand positions: {e}")

# Function to handle predictions from the pipeline
def my_sink(result, video_frame):
    # Extract hand positions from the result
    hand_positions = []
    
    if result and "model_all" in result:
        predictions = result["model_all"].get("predictions")
        print(f"predictions: {predictions}")
        if predictions and hasattr(predictions, "xyxy") and len(predictions.xyxy) > 0:
            # Extract data from the Detections object
            for i in range(len(predictions.xyxy)):
                bbox = predictions.xyxy[i]
                confidence = predictions.confidence[i]
                class_name = predictions.data["class_name"][i]
                
                # Calculate position data
                x = float(bbox[0])
                y = float(bbox[1])
                width = float(bbox[2] - bbox[0])
                height = float(bbox[3] - bbox[1])
                
                hand_positions.append({
                    "x": x,
                    "y": y,
                    "width": width,
                    "height": height,
                    "confidence": float(confidence),
                    "type": class_name
                })
    
    # Send hand positions to frontend if any were detected
    if hand_positions:
        hand_positions_queue.put(hand_positions)


# Initialize the video processing pipeline
inference_pipeline = InferencePipeline.init_with_workflow(
    api_key=os.getenv("API_KEY"),  
    workspace_name=os.getenv("WORKSPACE_NAME"),
    workflow_id=os.getenv("WORKFLOW_ID"),
    video_reference=0,  # Use webcam
    video_source_properties={
        "frame_width": int(os.getenv('FRAME_WIDTH', 1920)),
        "frame_height": int(os.getenv('FRAME_HEIGHT', 1080)),
    },
    on_prediction=my_sink
)

@sio.on('connect')
async def handle_connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.on('disconnect')
async def handle_disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

def run_inference_pipeline():
    inference_pipeline.start()
    inference_pipeline.join()

# By executing this file, the server starts and creates three main concurrent components:
# 1. Video Pipeline Thread: Processes video frames
# 2. Background Handler: Sends hand positions via WebSocket
# 3. Uvicorn Server: Handles WebSocket connections
if __name__ == "__main__":
    import uvicorn  # ASGI server implementation
    import threading  # For running the pipeline in parallel
    
    logger.info("Starting server...")
    
    # Start pipeline in a separate thread
    # daemon=True means this thread will automatically shut down when the main program exits
    inference_pipeline_thread = threading.Thread(target=run_inference_pipeline, daemon=True)
    inference_pipeline_thread.start()
    
    # Create and start background handler before uvicorn
    async def start_server():
        # Start background handler
        logger.info("Starting background handler...")
        background_task = asyncio.create_task(background_handler())
        
        config = uvicorn.Config(app, host="0.0.0.0", port=6789)
        server = uvicorn.Server(config)
        await server.serve()
        
        # Wait for background task
        await background_task
    
    # Run everything in the async context
    asyncio.run(start_server()) 