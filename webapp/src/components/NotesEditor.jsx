import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  TextField,
  Fab,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Undo,
  Redo,
  Search,
  Add,
  MoreVert,
  AccessTime,
  Person,
  Save,
  Delete,
  Share,
  Download
} from '@mui/icons-material';
import {
  saveMeetingNotes,
  getMeetingNotes,
  generateSummary,
  exportNotes
} from '../services/api';

// The rest of the file is the single, valid NotesEditor component (as in your later code)

const NotesEditor = () => {

  // Place all your hooks and state here, e.g.:
  // const [notes, setNotes] = useState('');
  // const [savedNotes, setSavedNotes] = useState('');
  // ... (add all your state and refs here)
  // Make sure to define all state variables and refs used below

  // Example (add all required state and refs):
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', severity: 'success' });
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('draft');
  const [isEditing, setIsEditing] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const editorRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);

  // You may need to add useEffect hooks and functions like loadNotes, loadNotesList, handleSave, etc.
  // For now, ensure all used variables and functions are defined.

  // Dummy implementations for missing functions (replace with your actual logic)
  const loadNotes = (id) => {};
  const loadNotesList = () => {};
  const handleSave = () => {};

  const handleDelete = async () => {
    try {
      // Implementation for deleting notes would go here
      setNotes('');
      setSavedNotes('');
      setSelectedNoteId(null);
      showNotification('Notes deleted successfully');
      setShowDeleteConfirm(false);
      loadNotesList();
    } catch (error) {
      console.error('Failed to delete notes:', error);
      showNotification('Failed to delete notes', 'error');
    }
  };

  const handleFormatting = (formatType) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    
    let formattedText = '';
    let newCursorPos = end;

    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = selectedText ? end + 4 : start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'bullet':
        formattedText = selectedText ? `• ${selectedText}` : '• ';
        newCursorPos = end + 2;
        break;
      case 'number':
        formattedText = selectedText ? `1. ${selectedText}` : '1. ';
        newCursorPos = end + 3;
        break;
      default:
        return;
    }

    const newText = notes.substring(0, start) + formattedText + notes.substring(end);
    setNotes(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleUndo = () => {
    if (undoStackRef.current.length > 0) {
      const previousState = undoStackRef.current.pop();
      redoStackRef.current.push(notes);
      setNotes(previousState);
    }
  };

  const handleRedo = () => {
    if (redoStackRef.current.length > 0) {
      const nextState = redoStackRef.current.pop();
      undoStackRef.current.push(notes);
      setNotes(nextState);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      const summary = await generateSummary(notes);
      setGeneratedSummary(summary);
      setShowSummaryDialog(true);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      showNotification('Failed to generate summary', 'error');
    }
  };

  const handleExport = async (format) => {
    try {
      const exportedData = await exportNotes(selectedNoteId, format);
      
      // Create download link
      const blob = new Blob([exportedData], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-notes-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification(`Notes exported as ${format.toUpperCase()}`);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Export failed', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: 'Meeting Notes',
          text: notes,
        });
      } catch (error) {
        console.error('Sharing failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(notes);
      showNotification('Notes copied to clipboard');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ show: true, message, severity });
  };

  const highlightSearchResults = (text) => {
    if (!searchQuery || !showSearch) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const addTextToNotes = (text) => {
    const timestamp = new Date().toLocaleTimeString();
    const newText = notes + (notes ? '\n\n' : '') + `[${timestamp}] ${text}`;
    setNotes(newText);
  };

  // Auto-save status indicator
  const getAutoSaveStatusColor = () => {
    switch (autoSaveStatus) {
      case 'saving': return 'warning';
      case 'saved': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Toolbar */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {/* Formatting Tools */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Bold">
                <IconButton 
                  size="small" 
                  onClick={() => handleFormatting('bold')}
                  disabled={!isEditing}
                >
                  <FormatBold />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Italic">
                <IconButton 
                  size="small" 
                  onClick={() => handleFormatting('italic')}
                  disabled={!isEditing}
                >
                  <FormatItalic />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Bullet List">
                <IconButton 
                  size="small" 
                  onClick={() => handleFormatting('bullet')}
                  disabled={!isEditing}
                >
                  <FormatListBulleted />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Numbered List">
                <IconButton 
                  size="small" 
                  onClick={() => handleFormatting('number')}
                  disabled={!isEditing}
                >
                  <FormatListNumbered />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Edit Controls */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Undo">
                <IconButton 
                  size="small" 
                  onClick={handleUndo}
                  disabled={!isEditing || undoStackRef.current.length === 0}
                >
                  <Undo />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Redo">
                <IconButton 
                  size="small" 
                  onClick={handleRedo}
                  disabled={!isEditing || redoStackRef.current.length === 0}
                >
                  <Redo />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
              {/* Auto-save Status */}
              <Chip
                size="small"
                label={autoSaveStatus === 'saving' ? 'Saving...' : 
                       autoSaveStatus === 'saved' ? 'Saved' : 
                       autoSaveStatus === 'error' ? 'Error' : 'Draft'}
                color={getAutoSaveStatusColor()}
                variant="outlined"
              />

              <Button
                size="small"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
              >
                Save
              </Button>

              <Button
                size="small"
                startIcon={<Share />}
                onClick={handleShare}
              >
                Share
              </Button>

              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          {/* Search Bar */}
          {showSearch && (
            <Box sx={{ mt: 2 }}>
              <TextField
                size="small"
                placeholder="Search in notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                fullWidth
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Notes List Sidebar */}
        <Card sx={{ width: 300, height: 'fit-content', display: { xs: 'none', md: 'block' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Notes
            </Typography>
            
            <List dense>
              {notesList.map((note) => (
                <ListItem
                  key={note.id}
                  button
                  selected={selectedNoteId === note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    loadNotes(note.id);
                  }}
                >
                  <ListItemText
                    primary={note.title || 'Untitled'}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          <AccessTime sx={{ fontSize: 12, mr: 0.5 }} />
                          {new Date(note.lastModified).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {note.wordCount} words
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Main Editor */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <TextField
              ref={editorRef}
              multiline
              fullWidth
              minRows={20}
              maxRows={30}
              value={notes}
              onChange={(e) => {
                // Save current state to undo stack
                if (notes !== e.target.value) {
                  undoStackRef.current.push(notes);
                  if (undoStackRef.current.length > 50) {
                    undoStackRef.current.shift();
                  }
                  redoStackRef.current = [];
                }
                setNotes(e.target.value);
              }}
              placeholder={isEditing ? "Start typing your meeting notes here..." : "No notes available"}
              disabled={!isEditing}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: 1.6,
                },
                '& textarea': {
                  resize: 'vertical',
                }
              }}
            />

            {/* Word Count */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {notes.split(/\s+/).filter(word => word.length > 0).length} words • {notes.length} characters
              </Typography>
              
              <Button
                size="small"
                onClick={handleGenerateSummary}
                disabled={!notes.trim()}
              >
                Generate Summary
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          display: { md: 'none' }
        }}
        onClick={() => setShowSearch(!showSearch)}
      >
        <Search />
      </Fab>

      {/* More Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          setShowSearch(!showSearch);
          setMenuAnchor(null);
        }}>
          <Search sx={{ mr: 1 }} />
          Search
        </MenuItem>
        <MenuItem onClick={() => {
          setShowExportDialog(true);
          setMenuAnchor(null);
        }}>
          <Download sx={{ mr: 1 }} />
          Export
        </MenuItem>
        <MenuItem onClick={() => {
          setShowDeleteConfirm(true);
          setMenuAnchor(null);
        }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>Export Notes</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Choose the format for exporting your notes:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={() => handleExport('txt')}>
              Text (.txt)
            </Button>
            <Button variant="outlined" onClick={() => handleExport('md')}>
              Markdown (.md)
            </Button>
            <Button variant="outlined" onClick={() => handleExport('pdf')}>
              PDF (.pdf)
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog 
        open={showSummaryDialog} 
        onClose={() => setShowSummaryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Generated Summary</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            fullWidth
            minRows={10}
            value={generatedSummary}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              navigator.clipboard.writeText(generatedSummary);
              showNotification('Summary copied to clipboard');
            }}
          >
            Copy
          </Button>
          <Button onClick={() => {
            addTextToNotes(`\n## Summary\n${generatedSummary}`);
            setShowSummaryDialog(false);
            showNotification('Summary added to notes');
          }}>
            Add to Notes
          </Button>
          <Button onClick={() => setShowSummaryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Delete Notes</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete these notes? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.show}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, show: false })}
      >
        <Alert 
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, show: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotesEditor;