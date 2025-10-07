import { useState, useCallback, useRef } from 'react';

export const useAudioCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startCapture = useCallback(async (onAudioLevel = () => {}) => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      mediaStreamRef.current = stream;
      setIsCapturing(true);

      // Set up audio analysis for volume level
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyzer = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;

      // Monitor audio level
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyzerRef.current && isCapturing) {
          analyzer.getByteFrequencyData(dataArray);
          
          // Calculate RMS (Root Mean Square) for audio level
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length);
          const level = rms / 255; // Normalize to 0-1
          
          onAudioLevel(level);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
      
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsCapturing(false);
      throw new Error('Microphone access denied or unavailable');
    }
  }, [isCapturing]);

  const stopCapture = useCallback(() => {
    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    analyzerRef.current = null;
    setIsCapturing(false);
  }, []);

  return {
    startCapture,
    stopCapture,
    isCapturing
  };
};