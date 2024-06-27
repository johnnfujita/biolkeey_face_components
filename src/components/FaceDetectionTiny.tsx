// src/FaceDetection.js
// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const FaceDetectionTiny = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const startVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;
    };

    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    };

    const handleVideoPlay = () => {
      intervalRef.current = setInterval(async () => {
        if (videoRef.current) {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()

    
  
          );

          const resizedDetections = faceapi.resizeResults(detections, {
            width: videoRef.current.width,
            height: videoRef.current.height,
          });

          const canvas = faceapi.createCanvasFromMedia(videoRef.current);
          canvasRef.current.innerHTML = '';
          canvasRef.current.append(canvas);
          faceapi.draw.drawDetections(canvas, resizedDetections);
        }
      }, 100);
    };

    loadModels();
    startVideo();

    if (videoRef.current) {
      videoRef.current.addEventListener('play', handleVideoPlay);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay muted width="720" height="560" />
      <div ref={canvasRef} />
    </div>
  );
};

export default FaceDetectionTiny;