// src/components/FaceDetection.jsx
// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useNavigate} from 'react-router-dom';

const FaceDetectionView = () => {
  const navigate = useNavigate()
  const videoRef = useRef();
  const canvasRef = useRef();
  const overlayCanvasRef = useRef();
  const mediaRecorderRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingChunks, setRecordingChunks] = useState([]);
  const [recordingComplete, setRecordingComplete] = useState(false)

  const MIN_WIDTH = 100; // Minimum width for the face to be considered close enough
  const HOLE_WIDTH = 200; // Width of the oval hole
  const HOLE_HEIGHT = 300; // Height of the oval hole
  const IOU_THRESHOLD = 0.5; // IoU threshold for determining if the face is centered

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setInitialized(true);
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (initialized) {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error('Error accessing webcam: ', err));

      const handleVideoPlay = () => {
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);
        faceapi.matchDimensions(overlayCanvas, displaySize);

        // Draw the initial overlay with an oval hole
        const overlayContext = overlayCanvas.getContext('2d');
        overlayContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
        overlayContext.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        drawOvalHole(overlayContext, displaySize.width / 2, displaySize.height / 2, HOLE_WIDTH, HOLE_HEIGHT);

        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.SsdMobilenetv1Options()
          ).withFaceLandmarks().withFaceExpressions();

          const resizedDetections = faceapi.resizeResults(detections, displaySize);

          const context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);

          let feedbackMessage = '';

          resizedDetections.forEach(det => {
            const { x, y, width, height } = det.detection.box;
            const isLargeEnough = width >= MIN_WIDTH;
            const isCentered = calculateIoU(det.detection.box, {
              x: displaySize.width / 2 - HOLE_WIDTH / 2,
              y: displaySize.height / 2 - HOLE_HEIGHT / 2,
              width: HOLE_WIDTH,
              height: HOLE_HEIGHT,
            }) >= IOU_THRESHOLD;

            if (!isLargeEnough) {
              feedbackMessage = 'Get closer';
              context.strokeStyle = 'red';
            } else {
              feedbackMessage = 'Perfect, keep this distance';
            }

            if (!isCentered) {
              const centerX = displaySize.width / 2;
              const centerY = displaySize.height / 2;
              if (x + width / 2 < centerX - HOLE_WIDTH / 2) {
                feedbackMessage = 'Move left';
              } else if (x + width / 2 > centerX + HOLE_WIDTH / 2) {
                feedbackMessage = 'Move right';
              }
              if (y + height / 2 < centerY - HOLE_HEIGHT / 2) {
                feedbackMessage = 'Put your face higher';
              } else if (y + height / 2 > centerY + HOLE_HEIGHT / 2) {
                feedbackMessage = 'Put your face lower';
              }
              context.strokeStyle = 'red';
            } else if (isLargeEnough) {
              context.strokeStyle = 'green';

              // Start recording if conditions are met and not already recording
              if (!isRecording) {
                startRecording();
              }
            }

            context.lineWidth = 2;
            context.strokeRect(x, y, width, height);
          });

          context.font = '20px Arial';
          context.fillStyle = 'white';
          context.fillText(feedbackMessage, 10, 30);
        }, 100);
      };

      videoRef.current.addEventListener('play', handleVideoPlay);
    }
  }, [initialized]);

  const startRecording = () => {
    const stream = videoRef.current.srcObject;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleRecordingStop;
    mediaRecorder.start();

    setIsRecording(true);

    setTimeout(() => {
      mediaRecorder.stop();
    }, 2000); // Stop recording after 2 seconds
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setRecordingChunks((prev) => [...prev, event.data]);
    }
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
    const videoBlob = new Blob(recordingChunks, { type: 'video/webm' });
    const videoUrl = URL.createObjectURL(videoBlob);
    console.log('Recording complete:', videoUrl);
    navigate("/success", {state: { videoURL: videoUrl}})
    
  };

  // Intersection over Union calculation
  const calculateIoU = (boxA, boxB) => {
    const xA = Math.max(boxA.x, boxB.x);
    const yA = Math.max(boxA.y, boxB.y);
    const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
    const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    const boxAArea = boxA.width * boxA.height;
    const boxBArea = boxB.width * boxB.height;

    const iou = interArea / (boxAArea + boxBArea - interArea);
    return iou;
  };

  // Function to draw an oval hole in the overlay
  const drawOvalHole = (ctx, cx, cy, width, height) => {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  };

  return (
    <div style={{ position: 'relative', width: '720px', height: '560px' }}>
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
      <canvas ref={overlayCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }} />
    </div>
  );
};

export default FaceDetectionView;