import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  IconButton,
  Chip,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Translate,
  RecordVoiceOver,
  SmartToy,
  Language,
  Security,
  Speed,
  ArrowForward,
  PlayArrow,
  VideoCall,
  Groups
} from '@mui/icons-material';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Translate sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Real-Time Translation',
      description: 'Instant translation in 100+ languages powered by Chrome AI',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: <RecordVoiceOver sx={{ fontSize: 48, color: theme.palette.secondary.main }} />,
      title: 'Live Subtitles',
      description: 'Real-time speech recognition with floating subtitle overlays',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: <SmartToy sx={{ fontSize: 48, color: '#ff6b6b' }} />,
      title: 'AI Meeting Notes',
      description: 'Intelligent summaries with key points and action items',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  const stats = [
    { number: '100+', label: 'Languages Supported' },
    { number: '<100ms', label: 'Translation Latency' },
    { number: '99.9%', label: 'Uptime' },
    { number: '50K+', label: 'Active Users' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Chip 
                  label="🚀 Now with Chrome Built-in AI"
                  sx={{ 
                    mb: 3, 
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 600
                  }}
                />
                
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 3,
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Speak Freely.
                  <br />
                  Understand Instantly.
                </Typography>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4, 
                    color: 'text.secondary',
                    fontWeight: 400,
                    lineHeight: 1.6
                  }}
                >
                  Break language barriers with real-time AI translation, 
                  live subtitles, and intelligent meeting summaries.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<VideoCall />}
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/meeting/new')}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Start Meeting
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Groups />}
                    onClick={() => navigate('/join')}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Join Room
                  </Button>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 400 },
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Language sx={{ fontSize: 120, color: 'white', opacity: 0.9 }} />
                  </motion.div>
                  
                  {/* Floating elements */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [-10, 10, -10] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                      position: 'absolute',
                      top: '20%',
                      left: '20%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  >
                    Hello! 👋
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [10, -10, 10] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    style={{
                      position: 'absolute',
                      bottom: '20%',
                      right: '20%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  >
                    ¡Hola! 🌍
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'primary.main',
                      mb: 1 
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Typography 
              variant="h2" 
              sx={{ 
                textAlign: 'center', 
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700
              }}
            >
              Powerful Features
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 6, 
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Experience the future of multilingual communication with our 
              cutting-edge AI-powered platform
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
                  whileHover={{ y: -10 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      border: 'none',
                      borderRadius: 4,
                      background: feature.gradient,
                      color: 'white',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ mb: 3 }}>
                        {React.cloneElement(feature.icon, { 
                          sx: { fontSize: 48, color: 'white' } 
                        })}
                      </Box>
                      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                    
                    {/* Background decoration */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 0
                      }}
                    />
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 4,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
              Ready to Break Language Barriers?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of users already connecting across languages
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={() => navigate('/meeting/new')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Your First Meeting
            </Button>
            
            {/* Background decoration */}
            <Box
              sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                zIndex: 0
              }}
            />
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingPage;