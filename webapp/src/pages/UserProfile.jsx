import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Slider,
  ColorLensOutlined
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Language,
  Notifications,
  Security,
  Palette,
  History,
  Download,
  Delete,
  Settings,
  Person,
  VolumeUp,
  Subtitles,
  Speed,
  Mic,
  Videocam
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    preferredLanguage: 'en',
    targetLanguage: 'es',
    timezone: 'America/New_York',
    avatar: null
  });

  const [preferences, setPreferences] = useState({
    enableNotifications: true,
    enableTTS: false,
    subtitleSize: 16,
    subtitlePosition: 'bottom',
    translationMode: 'fast', // 'fast' or 'precise'
    autoSaveNotes: true,
    enableMicByDefault: true,
    enableVideoByDefault: true,
    subtitleBackground: 'dark',
    subtitleColor: 'white'
  });

  // Mock meeting history
  const meetingHistory = [
    {
      id: 1,
      title: 'Product Planning Q1 2025',
      date: '2025-10-07',
      duration: '45 min',
      participants: 4,
      languages: ['English', 'Spanish', 'French'],
      hasNotes: true,
      status: 'completed'
    },
    {
      id: 2,
      title: 'Team Standup',
      date: '2025-10-06',
      duration: '15 min',
      participants: 6,
      languages: ['English', 'German'],
      hasNotes: false,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Client Presentation',
      date: '2025-10-05',
      duration: '60 min',
      participants: 8,
      languages: ['English', 'Japanese', 'Korean'],
      hasNotes: true,
      status: 'completed'
    }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
  ];

  const handleProfileChange = (field) => (event) => {
    setProfileData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePreferenceChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </div>
  );

  const getLanguageDisplay = (code) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Account Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your profile and customize your LinguaLive experience
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      fontWeight: 600
                    }}
                  >
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {profileData.firstName} {profileData.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {profileData.email}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                  <Chip
                    label={getLanguageDisplay(profileData.preferredLanguage)}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={getLanguageDisplay(profileData.targetLanguage)}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Button
                  variant={isEditing ? 'contained' : 'outlined'}
                  fullWidth
                  startIcon={isEditing ? <Save /> : <Edit />}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? 'Save Profile' : 'Edit Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Your Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Meetings</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {meetingHistory.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Languages Used</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      6
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Hours</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      24.5h
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                  <Tab label="Profile" icon={<Person />} iconPosition="start" />
                  <Tab label="Preferences" icon={<Settings />} iconPosition="start" />
                  <Tab label="Meeting History" icon={<History />} iconPosition="start" />
                </Tabs>
              </Box>

              {/* Profile Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Personal Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={profileData.firstName}
                        onChange={handleProfileChange('firstName')}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={profileData.lastName}
                        onChange={handleProfileChange('lastName')}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange('email')}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={!isEditing}>
                        <InputLabel>Preferred Language</InputLabel>
                        <Select
                          value={profileData.preferredLanguage}
                          onChange={handleProfileChange('preferredLanguage')}
                          label="Preferred Language"
                        >
                          {languages.map(lang => (
                            <MenuItem key={lang.code} value={lang.code}>
                              {lang.flag} {lang.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={!isEditing}>
                        <InputLabel>Default Target Language</InputLabel>
                        <Select
                          value={profileData.targetLanguage}
                          onChange={handleProfileChange('targetLanguage')}
                          label="Default Target Language"
                        >
                          {languages.map(lang => (
                            <MenuItem key={lang.code} value={lang.code}>
                              {lang.flag} {lang.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Preferences Tab */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ p: 4 }}>
                  {/* General Preferences */}
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    General Preferences
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.enableNotifications}
                            onChange={handlePreferenceChange('enableNotifications')}
                          />
                        }
                        label="Enable notifications"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.autoSaveNotes}
                            onChange={handlePreferenceChange('autoSaveNotes')}
                          />
                        }
                        label="Auto-save meeting notes"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Translation Mode</InputLabel>
                        <Select
                          value={preferences.translationMode}
                          onChange={handlePreferenceChange('translationMode')}
                          label="Translation Mode"
                        >
                          <MenuItem value="fast">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Speed />
                              Fast (Lower accuracy)
                            </Box>
                          </MenuItem>
                          <MenuItem value="precise">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Settings />
                              Precise (Higher accuracy)
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  {/* Audio/Video Preferences */}
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Audio & Video
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.enableTTS}
                            onChange={handlePreferenceChange('enableTTS')}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <VolumeUp />
                            Enable text-to-speech for translations
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.enableMicByDefault}
                            onChange={handlePreferenceChange('enableMicByDefault')}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Mic />
                            Enable microphone by default
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.enableVideoByDefault}
                            onChange={handlePreferenceChange('enableVideoByDefault')}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Videocam />
                            Enable camera by default
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  {/* Subtitle Customization */}
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    <Subtitles sx={{ mr: 1 }} />
                    Subtitle Appearance
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>Font Size</Typography>
                      <Slider
                        value={preferences.subtitleSize}
                        onChange={(e, value) => 
                          setPreferences(prev => ({ ...prev, subtitleSize: value }))
                        }
                        min={12}
                        max={24}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        valueLabelFormat={value => `${value}px`}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Position</InputLabel>
                        <Select
                          value={preferences.subtitlePosition}
                          onChange={handlePreferenceChange('subtitlePosition')}
                          label="Position"
                        >
                          <MenuItem value="top">Top</MenuItem>
                          <MenuItem value="center">Center</MenuItem>
                          <MenuItem value="bottom">Bottom</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Background</InputLabel>
                        <Select
                          value={preferences.subtitleBackground}
                          onChange={handlePreferenceChange('subtitleBackground')}
                          label="Background"
                        >
                          <MenuItem value="dark">Dark</MenuItem>
                          <MenuItem value="light">Light</MenuItem>
                          <MenuItem value="transparent">Transparent</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Text Color</InputLabel>
                        <Select
                          value={preferences.subtitleColor}
                          onChange={handlePreferenceChange('subtitleColor')}
                          label="Text Color"
                        >
                          <MenuItem value="white">White</MenuItem>
                          <MenuItem value="black">Black</MenuItem>
                          <MenuItem value="yellow">Yellow</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Preview */}
                  <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Subtitle Preview:
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        fontSize: `${preferences.subtitleSize}px`,
                        color: preferences.subtitleColor,
                        bgcolor: preferences.subtitleBackground === 'transparent' ? 'transparent' :
                               preferences.subtitleBackground === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                        border: preferences.subtitleBackground === 'transparent' ? '1px solid grey' : 'none'
                      }}
                    >
                      Hello, this is a subtitle example
                    </Box>
                  </Box>
                </Box>
              </TabPanel>

              {/* Meeting History Tab */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Recent Meetings
                  </Typography>

                  <List>
                    {meetingHistory.map((meeting, index) => (
                      <React.Fragment key={meeting.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {meeting.title.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {meeting.title}
                                </Typography>
                                {meeting.hasNotes && (
                                  <Chip label="Notes" size="small" color="success" />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {meeting.date} • {meeting.duration} • {meeting.participants} participants
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                  {meeting.languages.map((lang, i) => (
                                    <Chip
                                      key={i}
                                      label={lang}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton edge="end" size="small">
                                <Download />
                              </IconButton>
                              <IconButton edge="end" size="small">
                                <Delete />
                              </IconButton>
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < meetingHistory.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              </TabPanel>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile;