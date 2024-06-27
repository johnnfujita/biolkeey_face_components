// src/App.jsx
// @ts-nocheck
import React from 'react';
import { RouterProvider, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import FaceDetectionView2 from "./components/FaceDetectionView2"
import Success from './components/Success';
import VideoContainer from "./components/VideoContainer"
import FaceDetectionTiny from './components/FaceDetectionTiny';


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
  <Route path="/" element={<FaceDetectionView2/>} />
  <Route path="/tiny" element={<FaceDetectionTiny/>} />

  <Route path="/success" element={<Success/>} />
  <Route path="/video-container" element={<VideoContainer />} />
    </>
  )
)

function App({ path }: any) {

  router.navigate(path)
  return (

    <RouterProvider router={router}></RouterProvider>


  )
}

export default App
