import React, { useEffect, useRef, useState } from "react";

interface AudioAnalyzerProps {
  isPlaying: boolean;
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audio = useRef(new Audio("/Audio.mp3")).current;
  const [isAudioReady, setIsAudioReady] = useState(false);

  useEffect(() => {
    async function initAudioContext() {
        console.log("Initializing AudioContext...");
      const AudioContext = window.AudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyzer = audioContext.createAnalyser();
      analyzerRef.current = analyzer;

      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);

      audio.addEventListener("canplay", () => {
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }
        setIsAudioReady(true);

        console.log("Audio is ready to play");

      });

      console.log("Audio context initialized");

    }
    

    if (!audioContextRef.current) {
      initAudioContext();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audio]);

  console.log("AudioAnalyzer component mounted");

  useEffect(() => {
    if (isAudioReady) {
      if (isPlaying) {
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
          console.log("Trying to play audio again...");
        });
      } else {
        audio.pause();
        console.log("Audio paused");
      }
    }
  }, [isPlaying, isAudioReady]);

  useEffect(() => {
    if (!analyzerRef.current) return;

    const frequencyData = new Uint8Array(analyzerRef.current.frequencyBinCount);
    const updateFrequencyData = () => {
      if (!analyzerRef.current) return;

      analyzerRef.current.getByteFrequencyData(frequencyData);
      const color = calculateColorFromFrequencyData(frequencyData);
      onFrequencyChange(color);

      if (isPlaying) {
        requestAnimationFrame(updateFrequencyData);
      }
      console.log("Updating frequency data");

    };

    updateFrequencyData();
}, [isPlaying, onFrequencyChange]);


  useEffect(() => {
    if (!canvasRef.current || !analyzerRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    const frequencyData = new Uint8Array(analyzerRef.current.frequencyBinCount);
    const updateFrequencyData = () => {
      if (!analyzerRef.current || !ctx) return;

      analyzerRef.current.getByteFrequencyData(frequencyData);
      const color = calculateColorFromFrequencyData(frequencyData);
      drawVisualization(ctx, color);

      if (isPlaying) {
        requestAnimationFrame(updateFrequencyData);
      }
    };

    updateFrequencyData();
  }, [isPlaying]);

  const drawVisualization = (ctx: CanvasRenderingContext2D, color: string) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) * 0.25;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = radius * 0.5;

    ctx.fill();
  };

  const calculateColorFromFrequencyData = (frequencyData: Uint8Array) => {
    const avgFrequency = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length;
    const colorValue = Math.round((avgFrequency / 255) * 100);

    return `hsl(${colorValue}, 100%, 50%)`;
    console.log(`Color value calculated: ${colorValue}`);

  };

  return <canvas ref={canvasRef} width={400} height={400}></canvas>;
};

export default AudioAnalyzer;
function onFrequencyChange(color: string) {
    throw new Error("Function not implemented.");
}

