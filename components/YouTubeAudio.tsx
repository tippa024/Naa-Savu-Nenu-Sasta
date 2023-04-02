// components/YouTubeAudio.tsx
import React, { useRef, useState} from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import {PlayIcon, PauseIcon} from '@heroicons/react/24/outline'




function getYouTubeVideoID(url: string): string | null {
  const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regex);
  return match && match[2].length === 11 ? match[2] : null;
}

const YouTubeAudio: React.FC= () => {
  const videoUrl = 'https://www.youtube.com/watch?v=m2CdUHRcqo8';
  const videoId = getYouTubeVideoID(videoUrl);
  const playerRef = useRef<any>(null);

  const opts = {
    height: '1080', // Set height to screen height
    width: '1920', // Set width to '0' to only play audio
    playerVars: {
      autoplay: 0, // Do not auto-play the video
      controls: 0, // Hide controls
      modestbranding: 1, // Hide YouTube logo
      rel: 0, // Disable related videos
      showinfo: 0, // Hide video info
    },
  };

  const onReady = (event: { target: any }) => {
    playerRef.current = event.target;
  };

  if (!videoId) {
    return null;
  }

  const [play, setPlay] = useState(false);

  const handleTogglePlay = () => {
    if (playerRef.current) {
      if (play) {
        console.log('Pausing video');
        playerRef.current.pauseVideo();
      } else {
        console.log('Playing video');
        playerRef.current.playVideo();
      }
      setPlay(!play);
    }
  };
  
  return (
    <div className=''>
      
      
    </div>
  );
  
}


export default YouTubeAudio;
