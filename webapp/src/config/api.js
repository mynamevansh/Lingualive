/**
 * API Configuration for LinguaLive
 * Central configuration file for all API endpoints and settings
 */

// Get API base URL from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// API endpoints configuration
export const API_ENDPOINTS = {
  // AI Services
  TRANSLATE: '/api/ai/translate',
  DETECT_LANGUAGE: '/api/detect-language', 
  TRANSCRIBE_TRANSLATE: '/api/ai/transcribe-translate',
  GENERATE_SUMMARY: '/api/generate-summary',
  
  // Meeting Services
  MEETINGS_CREATE: '/api/meetings/create',
  MEETINGS_JOIN_SIGNATURE: '/api/meetings/join-signature',
  
  // Notes Services
  NOTES_SAVE: (id) => `/api/notes/${id}`,
  NOTES_GET: (id) => `/api/notes/${id}`,
  NOTES_EXPORT: (id, format) => `/api/notes/${id}/export?format=${format}`,
  
  // Test Endpoints
  CORS_TEST: '/api/data',
  HEALTH: '/health'
};

/**
 * Build complete URL for API endpoint
 * @param {string} endpoint - API endpoint path
 * @returns {string} Complete URL
 */
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Default fetch configuration
 */
export const DEFAULT_FETCH_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies for authentication
};

/**
 * Create fetch configuration with custom options
 * @param {Object} customConfig - Custom fetch configuration
 * @returns {Object} Merged fetch configuration
 */
export const createFetchConfig = (customConfig = {}) => {
  return {
    ...DEFAULT_FETCH_CONFIG,
    ...customConfig,
    headers: {
      ...DEFAULT_FETCH_CONFIG.headers,
      ...customConfig.headers,
    },
  };
};

/**
 * Utility function for making API requests
 * @param {string} endpoint - API endpoint path
 * @param {Object} config - Fetch configuration
 * @returns {Promise<Response>} Fetch response
 */
export const apiRequest = async (endpoint, config = {}) => {
  const url = buildApiUrl(endpoint);
  const fetchConfig = createFetchConfig(config);
  
  try {
    const response = await fetch(url, fetchConfig);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Environment information
export const ENV_INFO = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiBaseUrl: API_BASE_URL,
  mode: import.meta.env.MODE,
};

console.log('🔧 API Configuration loaded:', ENV_INFO);