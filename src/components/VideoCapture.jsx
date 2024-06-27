import React, { useRef, useState } from 'react';

const VideoCapture = ({ onCapture }) => {
  const videoRef = useRef();
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsRecording(true);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
       console.log("data object", blob)
        onCapture(URL.createObjectURL(blob));
      };
      mediaRecorder.start();
      setTimeout(stopCapture, 2000); // Stop recording after 8 seconds
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCapture = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <video ref={videoRef} />
      {!isRecording && <button onClick={startCapture}>Start Capture</button>}
    </div>
  );
};

export default VideoCapture;
