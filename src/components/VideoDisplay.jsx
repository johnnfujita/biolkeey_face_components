import React , {useEffect}from 'react';

const DisplayVideo = ({ videoData }) => {
  useEffect(()=>{
      console.log("latest data", videoData)
  },[videoData])
  return (
    <div>
      <p>Video Data {videoData}</p>
      <video controls>
        <source src={videoData} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default DisplayVideo;