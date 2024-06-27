import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'


import { useNavigate } from 'react-router-dom';
import axios from "axios"
const ffmpeg = createFFmpeg()
const FaceDetectionView2 = () => {
  const navigate = useNavigate();
  const videoRef = useRef();
  const canvasRef = useRef();
  const overlayCanvasRef = useRef();
  const mediaRecorderRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState([]);
  const chunkRef = useRef([]);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const animationFrameRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const MIN_WIDTH = 100;
  const HOLE_WIDTH = 200;
  const HOLE_HEIGHT = 300;
  const IOU_THRESHOLD = 0.5;

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setInitialized(true);
    };
    if (!isVideoEnded) {
      loadModels();
    }
  }, []);

  console.log("JOEFJIE")

  useEffect(() => {
    console.log("HEEEEasdasdY")
    const convertAndSendVideo = async () => {
      console.log(isRecording
        ,isVideoEnded
      )
      if (!isRecording && isVideoEnded) {
        const videoUrl = URL.createObjectURL(videoBlob);
        console.log(videoUrl )
        // Convert WebM to MP4 using ffmpeg.js
        try {
             console.log("here")
          
          await ffmpeg.load();
        } catch(e) {
          console.log("ERROR")
          throw new Error(`${e}`)
        }
        console.log("here")
        try {
          ffmpeg.FS('writeFile', 'recording.webm', await fetchFile(videoBlob));
          await ffmpeg.run('-i', 'recording.webm', '-vcodec', 'libx264', '-crf', '28', 'output.mp4');
        } catch(e) {
          console.log("ERROR 2")
          throw new Error(`${e}`)
        }
        console.log("here data")
      
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });

        // Create a FormData object to send the MP4 video
        console.log("here data form")
        const formData = new FormData();
        formData.append('file', mp4Blob, 'recording.mp4');
        formData.append("attempt_id", 59)
        // Send the video using axios
        axios.post('http://localhost:8000/biolkeey/face-scan', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            "Authorization": "bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIrNTU4NTk4ODUyNjgwMyIsInBob25lX3ZlcmlmaWVkIjp0cnVlLCJlbWFpbCI6ImN0b0BvbGtlZXkuYXBwIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV4cCI6MTcxODgxMTY1MiwiaWF0IjoxNzE4ODA5ODUyLCJyb2xlcyI6W3siaWQiOjEsInJvbGVfaWQiOjEsInByb2R1Y2VyX2lkIjoxLCJldmVudF9pZCI6bnVsbH0seyJpZCI6Miwicm9sZV9pZCI6MiwicHJvZHVjZXJfaWQiOjEsImV2ZW50X2lkIjpudWxsfSx7ImlkIjozLCJyb2xlX2lkIjoxOCwicHJvZHVjZXJfaWQiOjEsImV2ZW50X2lkIjpudWxsfSx7ImlkIjo0LCJyb2xlX2lkIjoyMiwicHJvZHVjZXJfaWQiOjEsImV2ZW50X2lkIjpudWxsfV0sImJhbmRfcm9sZXMiOlt7ImlkIjoxLCJiYW5kX3JvbGVfaWQiOjI0LCJtYW5hZ2VyX2lkIjoxLCJiYW5kX2lkIjpudWxsfV0sImVzdGFibGlzaG1lbnRfcm9sZXMiOlt7ImlkIjoxLCJlc3RhYmxpc2htZW50X3JvbGVfaWQiOjMwLCJlc3RhYmxpc2htZW50X2lkIjoxfV0sImFjdGl2ZV9yb2xlIjp7ImlkIjo0LCJyb2xlX2lkIjoyMiwicHJvZHVjZXJfaWQiOjEsImV2ZW50X2lkIjpudWxsfSwicHJvZmlsZV9pZCI6MX0.LCSeer7jqb8ASfpDWhxT5xF61qAUG_MQJgysffydkk7KWigymJoWJFSqSzOv3Y4INnwoUYOo1sMVpyHhe4i5og"
          }
        })
        .then(response => {
          console.log('Video uploaded successfully:', response.data);
        })
        .catch(error => {
          console.error('Error uploading video:', error);
        });
        console.log("NAV?")
        navigate("/success", { state: { videoURL: videoUrl } });
      }
    };

    convertAndSendVideo();
  }, [isRecording, isVideoEnded]);
  useEffect(() => {
    if (initialized) {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error('Error accessing webcam: ', err));

      videoRef.current.addEventListener('ended', handleVideoEnded);
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized && !isVideoEnded) {
      const handleVideoPlay = () => {
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);
        faceapi.matchDimensions(overlayCanvas, displaySize);

        const overlayContext = overlayCanvas.getContext('2d');
        overlayContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
        overlayContext.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        drawOvalHole(overlayContext, displaySize.width / 2, displaySize.height / 2, HOLE_WIDTH, HOLE_HEIGHT);

        const detectAndDraw = async () => {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.SsdMobilenetv1Options()
          ).withFaceLandmarks().withFaceExpressions();

          const resizedDetections = faceapi.resizeResults(detections, displaySize);

          const context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);

          let feedbackMessage = '';
          let centeredFeedbackMessage = ''
          let finalMessage = ""
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
              feedbackMessage = 'Aproxime';
              context.strokeStyle = 'red';
            } else {
              feedbackMessage = 'Distância Correta';
            }

            if (!isCentered) {
              const centerX = displaySize.width / 2;
              const centerY = displaySize.height / 2;
              if (x + width / 2 < centerX - HOLE_WIDTH / 2) {
                centeredFeedbackMessage = 'Mova a camera para direita';
              } else if (x + width / 2 > centerX + HOLE_WIDTH / 2) {
                centeredFeedbackMessage = 'Mova a camera para esquerda';
              }
              if (y + height / 2 < centerY - HOLE_HEIGHT / 2) {
                centeredFeedbackMessage = 'Abaixe a camera';
              } else if (y + height / 2 > centerY + HOLE_HEIGHT / 2) {
                centeredFeedbackMessage = 'Suba a camera';
              }
              context.strokeStyle = 'red';
            } else if (isLargeEnough) {
              feedbackMessage = ""
              centeredFeedbackMessage = ""
              finalMessage = "Segure essa posição"
              context.strokeStyle = 'green';

              if (!isRecording && !isVideoEnded && chunkRef.current.length === 0) {
                startRecording();
              }
            }

            context.lineWidth = 2;
            context.strokeRect(x, y, width, height);

            if (isRecording && (!isLargeEnough || !isCentered)) {
              stopRecordingEarly();
            }
          });

          context.font = '20px Arial';
          context.fillStyle = 'white';
          context.fillText(feedbackMessage, 10, 30);
          context.fillText(centeredFeedbackMessage, 10, 60);
          context.fillText(finalMessage, 10, 30)
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
        };

        animationFrameRef.current = requestAnimationFrame(detectAndDraw);
      };

      videoRef.current.addEventListener('play', handleVideoPlay);
    }

  }, [initialized, isVideoEnded]);

  const startRecording = () => {
    const stream = videoRef.current.srcObject;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleRecordingStop;

    mediaRecorder.start();

    setIsRecording(true);

    recordingTimeoutRef.current = setTimeout(() => {
      mediaRecorder.stop();
    }, 2000); // Stop recording after 2 seconds
  };

  const stopRecordingEarly = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearTimeout(recordingTimeoutRef.current);
      chunkRef.current = []; // Discard the recorded chunks
      setIsRecording(false);
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0 && !isVideoEnded) {
      chunkRef.current.push(event.data);
    }
  };

  const handleRecordingStop = () => {
    cancelAnimationFrame(animationFrameRef.current);
    if (chunkRef.current.length > 0) {
      setVideoBlob(new Blob(chunkRef.current, { type: 'video/webm' }));
      setIsVideoEnded(true);
      console.log("HERREE")
      setIsRecording(false);
     
    } else {
      console.log('Recording was discarded.');
    }
  };

  const handleVideoEnded = () => {
    setIsVideoEnded(true);
    cancelAnimationFrame(animationFrameRef.current);
  };

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

  const drawOvalHole = (ctx, cx, cy, width, height) => {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  };

  return (
    <div style={{ overflow: "hidden", height: "100vh", width: "100vw", backgroundColor: "black"}}>
      <div><h1>Headerr
        </h1>
        </div>
       <div style={{ position: 'relative', width: innerWidth, height: innerWidth * (560 /720) }}>
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
      <canvas ref={overlayCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }} />
    </div>
    </div>
   
  );
};

export default FaceDetectionView2;
