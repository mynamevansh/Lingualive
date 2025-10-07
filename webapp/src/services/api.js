// API service for LinguaLive
const API_BASE = 'http://localhost:3001';

// Translation service
export const translateText = async (text, sourceLanguage, targetLanguage) => {
  try {
    const response = await fetch(`${API_BASE}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    
    const data = await response.json();
    return data.translatedText || text; // Fallback to original text
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
};

// Language detection service
export const detectLanguage = async (text) => {
  try {
    const response = await fetch(`${API_BASE}/api/detect-language`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Language detection failed');
    }
    
    const data = await response.json();
    return data.language || 'en'; // Default to English
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English on error
  }
};

// Meeting notes services
export const saveMeetingNotes = async (id, noteData) => {
  try {
    const response = await fetch(`${API_BASE}/api/notes/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save notes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Save notes error:', error);
    throw error;
  }
};

export const getMeetingNotes = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/notes/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to get notes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get notes error:', error);
    return null;
  }
};

export const generateSummary = async (text) => {
  try {
    const response = await fetch(`${API_BASE}/api/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }
    
    const data = await response.json();
    return data.summary || 'Summary generation failed';
  } catch (error) {
    console.error('Summary generation error:', error);
    return 'Summary generation failed';
  }
};

export const exportNotes = async (id, format) => {
  try {
    const response = await fetch(`${API_BASE}/api/notes/${id}/export?format=${format}`);
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return await response.text();
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};