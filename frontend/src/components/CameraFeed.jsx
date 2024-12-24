import React, { useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import "./CameraFeed.css";

const CameraFeed = React.forwardRef(({ onDisplaySize }, ref) => {
  const handleResize = useCallback(() => {
    const container = document.querySelector(".camera-container");
    if (container) {
      onDisplaySize({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="camera-container">
      <Webcam
        ref={ref}
        mirrored={true}
        className="webcam-feed"
        videoConstraints={{
          width: 1920,
          height: 1080,
        }}
      />
    </div>
  );
});

CameraFeed.displayName = "CameraFeed";

export default CameraFeed;
