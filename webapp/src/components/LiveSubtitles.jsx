import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Alert,
  LinearProgress,
  Fade,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Mic,
  MicOff,
  Settings,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Translate,
  RecordVoiceOver,
} from '@mui/icons-material';

// Hooks
import { useAudioCapture } from '../hooks/useAudioCapture';
import { useSocket } from '../hooks/useSocket';

// Services
import { translateText, detectLanguage } from '../services/api';

const LiveSubtitles = () => {
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [enableTranslation, setEnableTranslation] = useState(true);
  const [enableTTS, setEnableTTS] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);
  const [confidence, setConfidence] = useState(0);

  // Refs
  const subtitleContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Custom hooks
  const { startCapture, stopCapture, isCapturing } = useAudioCapture();
  const socket = useSocket();

  // Languages configuration
  const languages = {
    'en': 'English',
    'es': 'Spanish', 
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
  };

  useEffect(() => {
    setupSpeechRecognition();
    setupSpeechSynthesis();
    
    return () => {
      cleanup();
    };
  }, [sourceLanguage]);

  useEffect(() => {
    if (socket) {
      socket.on('subtitle-update', handleRemoteSubtitle);
      socket.on('translation-update', handleRemoteTranslation);
      
      return () => {
        socket.off('subtitle-update');
        socket.off('translation-update');
      };
    }
  }, [socket]);

  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = sourceLanguage;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = async (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence || 0);
          } else {
            interimTranscript += transcript;
          }
        }

        const displayText = finalTranscript || interimTranscript;
        setCurrentText(displayText);

        // Broadcast to other users
        if (socket && displayText) {
          socket.emit('subtitle-update', {
            text: displayText,
            language: sourceLanguage,
            timestamp: Date.now(),
            isFinal: !!finalTranscript
          });
        }

        // Translate final text
        if (finalTranscript && enableTranslation) {
          await handleTranslation(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
        
        // Auto-restart on certain errors
        if (event.error === 'no-speech' || event.error === 'network') {
          setTimeout(() => {
            if (isActive) {
              recognitionRef.current?.start();
            }
          }, 1000);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        
        // Auto-restart if still active
        if (isActive) {
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 500);
        }
      };
    } else {
      setError('Speech recognition not supported in this browser');
    }
  };

  const setupSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  };

  const handleTranslation = async (text) => {
    try {
      const translated = await translateText(text, sourceLanguage, targetLanguage);
      setTranslatedText(translated);

      // Broadcast translation
      if (socket) {
        socket.emit('translation-update', {
          originalText: text,
          translatedText: translated,
          sourceLanguage,
          targetLanguage,
          timestamp: Date.now()
        });
      }

      // Text-to-speech for translation
      if (enableTTS && translated) {
        speakText(translated, targetLanguage);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      setError('Translation failed. Please try again.');
    }
  };

  const speakText = (text, language) => {
    if (synthesisRef.current && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // Find appropriate voice
      const voices = synthesisRef.current.getVoices();
      const voice = voices.find(v => v.lang.startsWith(language)) || voices[0];
      if (voice) utterance.voice = voice;

      synthesisRef.current.speak(utterance);
    }
  };

  const handleRemoteSubtitle = (data) => {
    if (!isActive) return;
    
    setCurrentText(data.text);
    if (data.isFinal && enableTranslation) {
      handleTranslation(data.text);
    }
  };

  const handleRemoteTranslation = (data) => {
    if (!isActive) return;
    
    setTranslatedText(data.translatedText);
    if (enableTTS) {
      speakText(data.translatedText, data.targetLanguage);
    }
  };

  const toggleListening = async () => {
    if (!isActive) {
      try {
        // Start audio capture
        await startCapture((level) => setAudioLevel(level));
        
        // Start speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
        
        setIsActive(true);
        setError(null);
      } catch (error) {
        console.error('Failed to start:', error);
        setError('Failed to start audio capture. Please check microphone permissions.');
      }
    } else {
      // Stop everything
      stopCapture();
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      setIsActive(false);
      setIsListening(false);
      setCurrentText('');
      setTranslatedText('');
      setAudioLevel(0);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && subtitleContainerRef.current) {
      if (subtitleContainerRef.current.requestFullscreen) {
        subtitleContainerRef.current.requestFullscreen();
      } else if (subtitleContainerRef.current.webkitRequestFullscreen) {
        subtitleContainerRef.current.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setCurrentText('');
    setTranslatedText('');
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    stopCapture();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Control Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {/* Language Selection */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>From</InputLabel>
                  <Select
                    value={sourceLanguage}
                    label="From"
                    onChange={(e) => setSourceLanguage(e.target.value)}
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <MenuItem key={code} value={code}>{name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <IconButton onClick={swapLanguages} size="small">
                  <Translate />
                </IconButton>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>To</InputLabel>
                  <Select
                    value={targetLanguage}
                    label="To"
                    onChange={(e) => setTargetLanguage(e.target.value)}
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <MenuItem key={code} value={code}>{name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Controls */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant={isActive ? "contained" : "outlined"}
                  color={isActive ? "error" : "primary"}
                  startIcon={isActive ? <MicOff /> : <Mic />}
                  onClick={toggleListening}
                  size="large"
                  className={isListening ? 'recording' : ''}
                >
                  {isActive ? 'Stop' : 'Start'} Live Subtitles
                </Button>

                <Tooltip title="Fullscreen">
                  <IconButton onClick={toggleFullscreen}>
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Settings */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableTranslation}
                      onChange={(e) => setEnableTranslation(e.target.checked)}
                    />
                  }
                  label="Translate"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableTTS}
                      onChange={(e) => setEnableTTS(e.target.checked)}
                    />
                  }
                  label={enableTTS ? <VolumeUp /> : <VolumeOff />}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Status */}
          {isActive && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Chip 
                  icon={<RecordVoiceOver />}
                  label={isListening ? 'Listening...' : 'Ready'}
                  color={isListening ? 'success' : 'default'}
                  variant={isListening ? 'filled' : 'outlined'}
                />
                
                {confidence > 0 && (
                  <Chip 
                    label={`Confidence: ${Math.round(confidence * 100)}%`}
                    size="small"
                    color={confidence > 0.7 ? 'success' : confidence > 0.5 ? 'warning' : 'error'}
                  />
                )}
              </Box>
              
              {/* Audio Level Indicator */}
              <LinearProgress 
                variant="determinate" 
                value={audioLevel * 100} 
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Subtitle Display */}
      <Card 
        ref={subtitleContainerRef}
        sx={{ 
          minHeight: 400,
          background: isFullscreen ? 'rgba(0, 0, 0, 0.9)' : 'default',
          color: isFullscreen ? 'white' : 'default',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {!isActive ? (
            <Box sx={{ py: 8 }}>
              <Typography variant="h4" color="text.secondary" gutterBottom>
                Live Subtitles & Translation
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Click "Start Live Subtitles" to begin real-time speech recognition and translation
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 4 }}>
              {/* Original Text */}
              <Fade in={!!currentText}>
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 2,
                      color: isFullscreen ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                      fontSize: isFullscreen ? '1.5rem' : '1.25rem'
                    }}
                  >
                    Original ({languages[sourceLanguage]}):
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontSize: isFullscreen ? '2.5rem' : '1.75rem',
                      lineHeight: 1.4,
                      minHeight: '1.4em',
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: isFullscreen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {currentText || 'Listening for speech...'}
                  </Typography>
                </Box>
              </Fade>

              {/* Translated Text */}
              {enableTranslation && (
                <Fade in={!!translatedText}>
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 2,
                        color: 'primary.main',
                        fontSize: isFullscreen ? '1.5rem' : '1.25rem'
                      }}
                    >
                      Translated ({languages[targetLanguage]}):
                    </Typography>
                    <Typography 
                      variant="h3" 
                      color="primary"
                      sx={{ 
                        fontSize: isFullscreen ? '3rem' : '2rem',
                        fontWeight: 600,
                        lineHeight: 1.3,
                        minHeight: '1.3em',
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'rgba(79, 172, 254, 0.1)',
                        border: '2px solid rgba(79, 172, 254, 0.3)'
                      }}
                    >
                      {translatedText || (currentText ? 'Translating...' : 'Translation will appear here')}
                    </Typography>
                  </Box>
                </Fade>
              )}

              {/* Audio Visualization */}
              {isListening && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <div className="audio-visualizer">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i}
                        className="audio-bar"
                        style={{
                          height: `${Math.max(5, audioLevel * 25 + Math.random() * 10)}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LiveSubtitles;