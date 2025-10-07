// API service for LinguaLive
import { apiRequest, API_ENDPOINTS, buildApiUrl } from '../config/api.js';

// Translation service
export const translateText = async (text, sourceLanguage, targetLanguage) => {
  try {
    const response = await apiRequest(API_ENDPOINTS.TRANSLATE, {
      method: 'POST',
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
    const response = await apiRequest(API_ENDPOINTS.DETECT_LANGUAGE, {
      method: 'POST',
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
    const response = await apiRequest(API_ENDPOINTS.NOTES_SAVE(id), {
      method: 'POST',
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
    const response = await apiRequest(API_ENDPOINTS.NOTES_GET(id));
    
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
    const response = await apiRequest(API_ENDPOINTS.GENERATE_SUMMARY, {
      method: 'POST',
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
    const response = await apiRequest(API_ENDPOINTS.NOTES_EXPORT(id, format));
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return await response.text();
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};