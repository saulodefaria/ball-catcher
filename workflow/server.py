import asyncio
import socketio
import cv2
from inference import InferencePipeline
import queue
import logging
from dotenv import load_dotenv
import os

load_dotenv()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

hand_positions_queue = queue.Queue()

# Initialize Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode='asgi')
app = socketio.ASGIApp(sio)

# Function to send hand positions to all connected clients
async def send_hand_positions(hand_positions):
    await sio.emit('handPosition', hand_positions)
    
async def background_handler():
    logger.info("Background handler started")
    while True:
        await asyncio.sleep(0.02)  # 50 FPS check
        if not hand_positions_queue.empty():
            positions = hand_positions_queue.get()
            logger.debug(f"Emitting hand positions: {positions}")
            try:
                await sio.emit("handPosition", positions)
            except Exception as e:
                logger.error(f"Error emitting hand positions: {e}")

def my_sink(result, video_frame):
    if result.get("output_image"):
      cv2.waitKey(1)
    
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


# Initialize the pipeline
pipeline = InferencePipeline.init_with_workflow(
    api_key=os.getenv("API_KEY"),  
    workspace_name=os.getenv("WORKSPACE_NAME"),
    workflow_id=os.getenv("WORKFLOW_ID"),
    video_reference=0,  # Use webcam
    video_source_properties={
        "frame_width": int(os.getenv('FRAME_WIDTH', 1920)),
        "frame_height": int(os.getenv('FRAME_HEIGHT', 1080)),
        "fps": 30.0,
    },
    on_prediction=my_sink
)

@sio.on('connect')
async def handle_connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.on('disconnect')
async def handle_disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

def run_pipeline():
    pipeline.start()
    pipeline.join()

if __name__ == "__main__":
    import uvicorn
    import threading
    
    logger.info("Starting server...")
    
    # Start pipeline in a separate thread
    pipeline_thread = threading.Thread(target=run_pipeline)
    pipeline_thread.daemon = True
    pipeline_thread.start()
    
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