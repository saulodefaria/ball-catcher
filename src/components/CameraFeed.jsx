import React from "react";
import Webcam from "react-webcam";
import "./CameraFeed.css";

const CameraFeed = React.forwardRef((props, ref) => {
  // const onUserMedia = (stream) => {
  //   const videoTrack = stream.getVideoTracks()[0];
  //   const settings = videoTrack.getSettings();
  //   console.log("Actual video settings:", settings);
  //   // You can access settings.width and settings.height here
  //   if (props.onVideoSettings) {
  //     props.onVideoSettings(settings);
  //   }
  // };

  return (
    <div className="camera-container">
      <Webcam
        ref={ref}
        mirrored={true}
        className="webcam-feed"
        videoConstraints={{
          // width: 640,
          // height: 480,
          width: 1920,
          height: 1080,
          // aspectRatio: 4 / 3,
        }}
        // onUserMedia={onUserMedia}
      />
    </div>
  );
});

CameraFeed.displayName = "CameraFeed";

export default CameraFeed;
