import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Paper,
  Divider,
  Card,
  CardContent,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  Download,
  Share,
  Edit,
  Save,
  Print,
  Refresh,
  SmartToy,
  AccessTime,
  Person,
  Language,
  FileCopy,
  CloudDownload,
  Email,
  Link,
  Summarize,
  Assignment,
  CheckCircle,
  Schedule,
  Groups
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const NotesAndSummary = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const transcriptRef = useRef(null);
  
  // Mock meeting data
  const meetingInfo = {
    title: 'Product Planning Q1 2025',
    date: 'October 7, 2025',
    duration: '45 minutes',
    participants: [
      { name: 'John Doe', role: 'Product Manager', avatar: 'JD' },
      { name: 'María García', role: 'Designer', avatar: 'MG' },
      { name: 'Pierre Dubois', role: 'Developer', avatar: 'PD' },
      { name: 'Sarah Kim', role: 'Marketing', avatar: 'SK' }
    ],
    languages: ['English', 'Spanish', 'French']
  };

  const mockTranscript = `[10:00] John Doe: Good morning everyone, thanks for joining today's planning session.

[10:01] María García: ¡Buenos días! Ready to discuss the Q1 roadmap.
→ Translation: Good morning! Ready to discuss the Q1 roadmap.

[10:02] Pierre Dubois: Bonjour à tous. J'ai préparé les estimations techniques.
→ Translation: Hello everyone. I prepared the technical estimates.

[10:03] John Doe: Perfect. Let's start with the user research findings from last month.

[10:05] Sarah Kim: The user feedback shows strong demand for mobile optimization. We should prioritize this for Q1.

[10:07] María García: Estoy de acuerdo. Los usuarios móviles representan el 70% de nuestro tráfico.
→ Translation: I agree. Mobile users represent 70% of our traffic.

[10:10] Pierre Dubois: Du point de vue technique, nous pouvons livrer la version mobile en 8 semaines.
→ Translation: From a technical standpoint, we can deliver the mobile version in 8 weeks.

[10:12] John Doe: Excellent. That aligns with our Q1 timeline. Let's discuss the budget allocation.

[10:15] Sarah Kim: Marketing budget should be $50K for the mobile launch campaign.

[10:18] María García: Necesitaremos también presupuesto para pruebas de usuario adicionales.
→ Translation: We'll also need budget for additional user testing.

[10:20] Pierre Dubois: Et pour l'infrastructure cloud, environ $15K par mois.
→ Translation: And for cloud infrastructure, about $15K per month.`;

  const mockSummary = `# Meeting Summary: Product Planning Q1 2025

## 📋 Key Decisions Made
• **Mobile optimization** is the top priority for Q1 2025
• **8-week timeline** approved for mobile version delivery
• **Budget allocation**: $50K for marketing campaign, $15K/month for infrastructure

## 🎯 Action Items
• **John Doe**: Finalize mobile development roadmap by Oct 14
• **María García**: Conduct additional user testing sessions (Budget: TBD)
• **Pierre Dubois**: Set up cloud infrastructure requirements
• **Sarah Kim**: Prepare mobile launch marketing campaign

## 📊 Key Metrics Discussed
• Mobile users: **70% of total traffic**
• Development timeline: **8 weeks**
• Marketing budget: **$50,000**
• Infrastructure cost: **$15,000/month**

## 🗣️ Participant Contributions
• **John Doe**: Meeting facilitation, timeline coordination
• **María García**: User experience insights, testing requirements
• **Pierre Dubois**: Technical feasibility, infrastructure planning  
• **Sarah Kim**: Marketing strategy, budget planning

## 📅 Next Steps
1. Technical requirements review - Due: Oct 10
2. User testing plan - Due: Oct 12  
3. Marketing timeline - Due: Oct 14
4. Final Q1 roadmap approval - Due: Oct 16`;

  useEffect(() => {
    setTranscript(mockTranscript);
    setSummary(mockSummary);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGeneratingSummary(false);
      setSummary(mockSummary);
    }, 3000);
  };

  const exportOptions = [
    { label: 'PDF Document', icon: <CloudDownload />, format: 'pdf' },
    { label: 'Word Document', icon: <Assignment />, format: 'docx' },
    { label: 'Markdown File', icon: <Edit />, format: 'md' },
    { label: 'Plain Text', icon: <FileCopy />, format: 'txt' }
  ];

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {meetingInfo.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip icon={<AccessTime />} label={meetingInfo.date} variant="outlined" />
                <Chip icon={<Schedule />} label={meetingInfo.duration} variant="outlined" />
                <Chip icon={<Groups />} label={`${meetingInfo.participants.length} participants`} variant="outlined" />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Share />}
                sx={{ borderRadius: 2 }}
              >
                Share
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => setExportDialogOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                Export
              </Button>
            </Box>
          </Box>

          {/* Meeting Info Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person /> Participants
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {meetingInfo.participants.map((participant, index) => (
                      <Tooltip key={index} title={participant.role}>
                        <Chip
                          avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{participant.avatar}</Avatar>}
                          label={participant.name}
                          variant="outlined"
                          size="small"
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Language /> Languages Used
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {meetingInfo.languages.map((language, index) => (
                      <Chip 
                        key={index}
                        label={language}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', minHeight: 600 }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              sx={{ px: 2 }}
            >
              <Tab 
                label="Live Transcript" 
                icon={<Assignment />} 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              <Tab 
                label="AI Summary" 
                icon={<Summarize />} 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            </Tabs>
          </Box>

          {/* Content Area */}
          <Box sx={{ height: 600, display: 'flex' }}>
            {/* Left Panel - Transcript */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Transcript Header */}
                <Box sx={{ p: 3, pb: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Meeting Transcript
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Refresh">
                        <IconButton size="small">
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy to clipboard">
                        <IconButton size="small">
                          <FileCopy />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Real-time transcript with automatic translation
                  </Typography>
                </Box>

                {/* Transcript Content */}
                <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50', minHeight: 400 }}>
                    <pre style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                      color: '#333'
                    }}>
                      {transcript}
                    </pre>
                  </Paper>
                </Box>
              </Box>
            </TabPanel>

            {/* Right Panel - AI Summary */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Summary Header */}
                <Box sx={{ p: 3, pb: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      AI-Generated Summary
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SmartToy />}
                        onClick={generateSummary}
                        disabled={isGeneratingSummary}
                        sx={{ borderRadius: 2 }}
                      >
                        {isGeneratingSummary ? 'Generating...' : 'Regenerate'}
                      </Button>
                      <IconButton 
                        size="small" 
                        onClick={() => setIsEditing(!isEditing)}
                        color={isEditing ? 'primary' : 'default'}
                      >
                        <Edit />
                      </IconButton>
                    </Box>
                  </Box>

                  {isGeneratingSummary && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        AI is analyzing the meeting transcript...
                      </Typography>
                      <LinearProgress />
                    </Box>
                  )}
                </Box>

                {/* Summary Content */}
                <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={20}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'monospace',
                          fontSize: '0.9rem'
                        }
                      }}
                    />
                  ) : (
                    <Paper sx={{ p: 3, bgcolor: 'primary.50', minHeight: 400 }}>
                      <Box 
                        sx={{ 
                          '& h1': { fontSize: '1.5rem', fontWeight: 700, mb: 2 },
                          '& h2': { fontSize: '1.2rem', fontWeight: 600, mb: 1.5, mt: 3 },
                          '& ul': { pl: 2 },
                          '& li': { mb: 0.5 },
                          '& strong': { fontWeight: 600 }
                        }}
                        dangerouslySetInnerHTML={{
                          __html: summary.replace(/\n/g, '<br>').replace(/#{1,6} /g, '<h2>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        }}
                      />
                    </Paper>
                  )}
                </Box>

                {isEditing && (
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={() => setIsEditing(false)}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      </motion.div>

      {/* Export Dialog */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Export Meeting Notes
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose your preferred format to download the meeting transcript and summary.
          </Typography>
          
          <List>
            {exportOptions.map((option, index) => (
              <ListItem 
                key={index} 
                button 
                sx={{ 
                  borderRadius: 2, 
                  mb: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {option.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={option.label}
                  secondary={`Export as .${option.format} file`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setExportDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Download All Formats
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotesAndSummary;