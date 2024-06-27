import { useState, useEffect } from 'react';
import VideoCapture from './VideoCapture';
import DisplayVideo from './VideoDisplay';

const VideoContainer = () => {
  const [capturedVideo, setCapturedVideo] = useState(null);



  const captureHandler = (data) => {
    console.log("called caputre handler", data)
    setCapturedVideo(data);
  };

  return (
    <div style={{background: "black"}}>
      <h1>Video Capture and Display</h1>
      <VideoCapture onCapture={captureHandler} />
      {capturedVideo && <DisplayVideo key={capturedVideo} videoData={capturedVideo} />}
    </div>
  );
};

export default VideoContainer
