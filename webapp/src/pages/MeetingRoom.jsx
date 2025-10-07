import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Paper,
  Avatar,
  Chip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  InputAdornment,
  Divider,
  Tooltip,
  Fab,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  Settings,
  CallEnd,
  Chat,
  People,
  Send,
  MoreVert,
  Fullscreen,
  VolumeUp,
  VolumeOff,
  Translate,
  Notes,
  Download
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MeetingRoom = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('participants'); // 'participants' or 'chat'
  const [message, setMessage] = useState('');
  const [isSubtitlesVisible, setIsSubtitlesVisible] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [translatedSubtitle, setTranslatedSubtitle] = useState('');
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(true);
  
  const messagesEndRef = useRef(null);
  
  // Mock data
  const participants = [
    { id: 1, name: 'John Doe', language: 'en', avatar: 'JD', isOnline: true, isSpeaking: false },
    { id: 2, name: 'María García', language: 'es', avatar: 'MG', isOnline: true, isSpeaking: true },
    { id: 3, name: 'Pierre Dubois', language: 'fr', avatar: 'PD', isOnline: true, isSpeaking: false },
    { id: 4, name: 'Hans Mueller', language: 'de', avatar: 'HM', isOnline: false, isSpeaking: false },
  ];

  const chatMessages = [
    { id: 1, sender: 'María García', message: '¡Hola a todos!', translation: 'Hello everyone!', time: '10:30', language: 'es' },
    { id: 2, sender: 'John Doe', message: 'Great to meet you all!', time: '10:31', language: 'en' },
    { id: 3, sender: 'Pierre Dubois', message: 'Bonjour, comment allez-vous?', translation: 'Hello, how are you?', time: '10:32', language: 'fr' },
  ];

  const languageFlags = {
    'en': '🇺🇸',
    'es': '🇪🇸', 
    'fr': '🇫🇷',
    'de': '🇩🇪'
  };

  useEffect(() => {
    // Simulate live subtitles
    const interval = setInterval(() => {
      const sampleTexts = [
        { original: "Hello, how are you today?", translated: "Hola, ¿cómo estás hoy?" },
        { original: "Let's discuss the project timeline.", translated: "Hablemos sobre el cronograma del proyecto." },
        { original: "I think we should focus on quality.", translated: "Creo que deberíamos centrarnos en la calidad." },
        { original: "", translated: "" }
      ];
      
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      setCurrentSubtitle(randomText.original);
      setTranslatedSubtitle(randomText.translated);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add message logic here
      setMessage('');
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  return (
    <Box sx={{ height: '100vh', bgcolor: 'grey.900', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box 
        sx={{ 
          bgcolor: 'grey.800', 
          px: 3, 
          py: 2, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Team Standup Meeting
          </Typography>
          <Chip 
            label="Live" 
            size="small" 
            sx={{ 
              bgcolor: 'error.main', 
              color: 'white',
              animation: 'pulse 2s infinite'
            }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            15:34 • 4 participants
          </Typography>
          <IconButton sx={{ color: 'white' }}>
            <Settings />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Video Area */}
          <Box 
            sx={{ 
              flex: 1, 
              bgcolor: 'grey.900', 
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Main Video */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: 'grey.800',
                borderRadius: 2,
                mx: 2,
                my: 2,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Video placeholder */}
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h2" sx={{ color: 'white', fontWeight: 600 }}>
                  MG
                </Typography>
              </Box>

              {/* Participant info overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  María García
                </Typography>
                <Typography sx={{ fontSize: '1.2rem' }}>
                  {languageFlags['es']}
                </Typography>
                {participants.find(p => p.id === 2)?.isSpeaking && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      animation: 'pulse 1s infinite'
                    }}
                  />
                )}
              </Box>

              {/* Audio level indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  display: 'flex',
                  gap: 1
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 4,
                      height: 20 + i * 5,
                      bgcolor: participants.find(p => p.id === 2)?.isSpeaking ? 'success.main' : 'grey.600',
                      borderRadius: 1,
                      animation: participants.find(p => p.id === 2)?.isSpeaking ? 
                        `audioBar 0.5s ease-in-out ${i * 0.1}s infinite alternate` : 'none'
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Floating Subtitles Panel */}
            <AnimatePresence>
              {isSubtitlesVisible && (currentSubtitle || translatedSubtitle) && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  style={{
                    position: 'absolute',
                    bottom: 100,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: 400,
                    maxWidth: '80%'
                  }}
                >
                  <Card 
                    sx={{ 
                      bgcolor: 'rgba(0, 0, 0, 0.9)',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {currentSubtitle && (
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Original:</strong> {currentSubtitle}
                        </Typography>
                      )}
                      {translatedSubtitle && isTranslationEnabled && (
                        <Typography variant="body1" sx={{ color: 'primary.light' }}>
                          <strong>Español:</strong> {translatedSubtitle}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fullscreen toggle */}
            <IconButton
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <Fullscreen />
            </IconButton>
          </Box>

          {/* Bottom Controls */}
          <Box 
            sx={{ 
              bgcolor: 'grey.800', 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 2
            }}
          >
            <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
              <IconButton
                onClick={toggleMute}
                sx={{
                  bgcolor: isMuted ? 'error.main' : 'grey.700',
                  color: 'white',
                  '&:hover': { bgcolor: isMuted ? 'error.dark' : 'grey.600' }
                }}
              >
                {isMuted ? <MicOff /> : <Mic />}
              </IconButton>
            </Tooltip>

            <Tooltip title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}>
              <IconButton
                onClick={toggleVideo}
                sx={{
                  bgcolor: !isVideoOn ? 'error.main' : 'grey.700',
                  color: 'white',
                  '&:hover': { bgcolor: !isVideoOn ? 'error.dark' : 'grey.600' }
                }}
              >
                {isVideoOn ? <Videocam /> : <VideocamOff />}
              </IconButton>
            </Tooltip>

            <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
              <IconButton
                onClick={toggleScreenShare}
                sx={{
                  bgcolor: isScreenSharing ? 'primary.main' : 'grey.700',
                  color: 'white',
                  '&:hover': { bgcolor: isScreenSharing ? 'primary.dark' : 'grey.600' }
                }}
              >
                {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'grey.600', mx: 1 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={isTranslationEnabled}
                  onChange={(e) => setIsTranslationEnabled(e.target.checked)}
                  size="small"
                />
              }
              label="Translation"
              sx={{ color: 'white', mr: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isSubtitlesVisible}
                  onChange={(e) => setIsSubtitlesVisible(e.target.checked)}
                  size="small"
                />
              }
              label="Subtitles"
              sx={{ color: 'white' }}
            />

            <Box sx={{ flex: 1 }} />

            <Button
              variant="contained"
              color="error"
              startIcon={<CallEnd />}
              sx={{ px: 3 }}
            >
              End Meeting
            </Button>
          </Box>
        </Box>

        {/* Sidebar */}
        <Box
          sx={{
            width: sidebarOpen ? 350 : 0,
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            bgcolor: 'grey.800',
            borderLeft: '1px solid',
            borderColor: 'grey.700'
          }}
        >
          {sidebarOpen && (
            <Box sx={{ width: 350, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Sidebar Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'grey.700' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={activeTab === 'participants' ? 'contained' : 'text'}
                    size="small"
                    startIcon={<People />}
                    onClick={() => setActiveTab('participants')}
                    sx={{ flex: 1, color: activeTab === 'participants' ? 'white' : 'grey.400' }}
                  >
                    Participants ({participants.length})
                  </Button>
                  <Button
                    variant={activeTab === 'chat' ? 'contained' : 'text'}
                    size="small"
                    startIcon={<Chat />}
                    onClick={() => setActiveTab('chat')}
                    sx={{ flex: 1, color: activeTab === 'chat' ? 'white' : 'grey.400' }}
                  >
                    Chat
                  </Button>
                </Box>
              </Box>

              {/* Sidebar Content */}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {activeTab === 'participants' ? (
                  <List sx={{ p: 0 }}>
                    {participants.map((participant) => (
                      <ListItem key={participant.id} sx={{ py: 1.5 }}>
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: participant.isOnline ? 'success.main' : 'grey.500',
                                  border: '2px solid white'
                                }}
                              />
                            }
                          >
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {participant.avatar}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                {participant.name}
                              </Typography>
                              <Typography sx={{ fontSize: '1rem' }}>
                                {languageFlags[participant.language]}
                              </Typography>
                              {participant.isSpeaking && (
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: 'success.main',
                                    animation: 'pulse 1s infinite'
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: 'grey.400' }}>
                              {participant.isOnline ? 'Online' : 'Offline'}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Chat Messages */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                      {chatMessages.map((msg) => (
                        <Box key={msg.id} sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ color: 'grey.400' }}>
                            {msg.sender} • {msg.time} {languageFlags[msg.language]}
                          </Typography>
                          <Paper 
                            sx={{ 
                              p: 1.5, 
                              mt: 0.5, 
                              bgcolor: 'grey.700',
                              borderRadius: 2
                            }}
                          >
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              {msg.message}
                            </Typography>
                            {msg.translation && (
                              <Typography 
                                variant="caption" 
                                sx={{ color: 'primary.light', mt: 0.5, display: 'block' }}
                              >
                                → {msg.translation}
                              </Typography>
                            )}
                          </Paper>
                        </Box>
                      ))}
                      <div ref={messagesEndRef} />
                    </Box>

                    {/* Chat Input */}
                    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.700' }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={handleSendMessage}>
                                <Send />
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: { color: 'white', bgcolor: 'grey.700' }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'grey.600' },
                            '&:hover fieldset': { borderColor: 'grey.500' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                          },
                          '& .MuiInputBase-input::placeholder': { color: 'grey.400' }
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', gap: 1 }}>
        <Fab
          size="small"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{ bgcolor: 'grey.700', color: 'white' }}
        >
          {activeTab === 'participants' ? <People /> : <Chat />}
        </Fab>
        <Fab
          size="small"
          sx={{ bgcolor: 'primary.main', color: 'white' }}
        >
          <Notes />
        </Fab>
      </Box>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes audioBar {
          0% { height: 10px; }
          100% { height: 30px; }
        }
      `}</style>
    </Box>
  );
};

export default MeetingRoom;