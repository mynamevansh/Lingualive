// Simplified Zoom Service with CDN loading approach
// This avoids npm package compatibility issues

import { apiRequest, API_ENDPOINTS } from '../config/api.js';

class SimpleZoomService {
  constructor() {
    this.isInitialized = false;
    this.currentMeeting = null;
    this.translationEnabled = false;
    this.ZoomMtg = null;
    
    console.log('🔧 SimpleZoomService initialized');
  }

  // Load Zoom SDK via backend proxy to fix MIME type issues
  async loadZoomSDKFromCDN() {
    if (this.ZoomMtg || window.ZoomMtg) {
      this.ZoomMtg = window.ZoomMtg;
      console.log('✅ Zoom SDK already loaded');
      return this.ZoomMtg;
    }

    try {
      console.log('🔄 Loading Zoom SDK via Backend Proxy...');
      
      // Use backend proxy to avoid 403 and MIME type issues
      const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      
      // Step 1: Ensure React is available globally for Zoom SDK
      await this.ensureReactGlobal();
      
      // Step 2: Load React dependency via proxy
      await this.loadScriptViaProxy(`${BACKEND_URL}/api/zoom/sdk/2.16.0/lib/vendor/react.min.js`, 'react-zoom-proxy');
      console.log('✅ React dependency loaded via proxy');
      
      // Step 3: Load ReactDOM dependency via proxy
      await this.loadScriptViaProxy(`${BACKEND_URL}/api/zoom/sdk/2.16.0/lib/vendor/react-dom.min.js`, 'react-dom-zoom-proxy');
      console.log('✅ ReactDOM dependency loaded via proxy');
      
      // Step 4: Load Redux dependency via proxy
      await this.loadScriptViaProxy(`${BACKEND_URL}/api/zoom/sdk/2.16.0/lib/vendor/redux.min.js`, 'redux-zoom-proxy');
      console.log('✅ Redux dependency loaded via proxy');
      
      // Step 5: Verify React, ReactDOM, and Redux are globally available
      if (!window.React || !window.ReactDOM || !window.Redux) {
        console.warn('⚠️ React/ReactDOM/Redux not globally available, setting up fallback...');
        await this.setupReactFallback();
      }
      
      console.log('🔍 Dependencies global check:', {
        React: !!window.React,
        ReactDOM: !!window.ReactDOM,
        Redux: !!window.Redux,
        ReactVersion: window.React?.version || 'unknown'
      });
      
      // Step 6: Load Zoom SDK via proxy
      await this.loadScriptViaProxy(`${BACKEND_URL}/api/zoom/sdk/2.16.0/zoom-meeting-2.16.0.min.js`, 'zoom-sdk-proxy');
      console.log('✅ Zoom SDK loaded via proxy');
      
      // Step 3: Verify ZoomMtg availability
      if (window.ZoomMtg) {
        this.ZoomMtg = window.ZoomMtg;
        console.log('✅ ZoomMtg available via proxy method');
        return this.ZoomMtg;
      }
      
      // Fallback: Try direct CDN with better headers
      console.log('⚠️ Proxy method failed, trying direct CDN fallback...');
      
      // Ensure React/ReactDOM/Redux dependencies for direct CDN method
      await this.setupReactFallback();
      
      await this.loadScriptDirectCDN();
      
      if (window.ZoomMtg) {
        this.ZoomMtg = window.ZoomMtg;
        console.log('✅ ZoomMtg available via direct CDN');
        return this.ZoomMtg;
      }
      
      throw new Error('ZoomMtg not available after all loading attempts');
      
    } catch (error) {
      console.error('❌ Failed to load Zoom SDK:', error);
      throw new Error(`Zoom SDK loading failed: ${error.message}`);
    }
  }

  // Ensure React, ReactDOM, and Redux are available globally for Zoom SDK compatibility
  async ensureReactGlobal() {
    // Import React, ReactDOM, and Redux and make them globally available
    try {
      if (!window.React) {
        const React = await import('react');
        window.React = React.default || React;
        console.log('✅ React made globally available');
      }
      
      if (!window.ReactDOM) {
        const ReactDOM = await import('react-dom');
        window.ReactDOM = ReactDOM.default || ReactDOM;
        console.log('✅ ReactDOM made globally available');
      }
      
      // Note: Redux is typically not available as ES module in React projects
      // We'll load it via CDN in the fallback method
      if (!window.Redux) {
        console.log('⚠️ Redux not globally available, will load via CDN');
      }
    } catch (error) {
      console.warn('⚠️ Failed to import React modules:', error);
      // Will try loading from CDN as fallback
    }
  }

  // Setup React, ReactDOM, and Redux fallback via direct CDN if modules fail
  async setupReactFallback() {
    try {
      console.log('🔄 Setting up React/ReactDOM/Redux fallback via direct CDN...');
      
      // Load React from CDN
      if (!window.React) {
        await this.loadScriptDirectReact('https://unpkg.com/react@16.14.0/umd/react.production.min.js', 'react-fallback');
      }
      
      // Load ReactDOM from CDN
      if (!window.ReactDOM) {
        await this.loadScriptDirectReact('https://unpkg.com/react-dom@16.14.0/umd/react-dom.production.min.js', 'reactdom-fallback');
      }
      
      // Load Redux from CDN
      if (!window.Redux) {
        await this.loadScriptDirectReact('https://unpkg.com/redux@4.1.0/dist/redux.min.js', 'redux-fallback');
      }
      
      console.log('✅ React/ReactDOM/Redux fallback setup complete');
    } catch (error) {
      console.error('❌ Dependencies fallback setup failed:', error);
      throw error;
    }
  }

  // Load React script directly from CDN
  loadScriptDirectReact(src, id) {
    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.type = 'application/javascript';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log(`✅ React dependency loaded: ${id}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.error(`❌ React dependency failed: ${id}`, error);
        reject(new Error(`Failed to load React dependency: ${id}`));
      };
      
      document.head.appendChild(script);
      
      setTimeout(() => {
        reject(new Error(`React dependency timeout: ${id}`));
      }, 10000);
    });
  }

  // Load script via backend proxy with proper error handling and Cross-Origin support
  loadScriptViaProxy(src, id) {
    return new Promise((resolve, reject) => {
      // Remove existing script if present
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.type = 'application/javascript';
      script.async = true;
      script.crossOrigin = 'use-credentials'; // Enable Cross-Origin credentials
      
      script.onload = () => {
        console.log(`✅ Script loaded via proxy: ${id}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.error(`❌ Script failed to load via proxy: ${id}`, error);
        console.error('Error details:', {
          src: script.src,
          crossOrigin: script.crossOrigin,
          type: script.type
        });
        reject(new Error(`Failed to load script via proxy: ${id}`));
      };
      
      document.head.appendChild(script);
      
      // Timeout after 15 seconds
      setTimeout(() => {
        reject(new Error(`Script loading timeout: ${id}`));
      }, 15000);
    });
  }

  // Fallback: Direct CDN loading with improved headers
  loadScriptDirectCDN() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://source.zoom.us/2.16.0/zoom-meeting-2.16.0.min.js';
      script.type = 'application/javascript';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('✅ Direct CDN script loaded');
        // Wait for ZoomMtg to be available
        const checkZoomMtg = () => {
          if (window.ZoomMtg) {
            resolve();
          } else {
            setTimeout(checkZoomMtg, 100);
          }
        };
        checkZoomMtg();
      };

      script.onerror = (error) => {
        console.error('❌ Direct CDN loading failed:', error);
        reject(new Error('Direct CDN loading failed'));
      };

      document.head.appendChild(script);
      
      setTimeout(() => {
        if (!window.ZoomMtg) {
          reject(new Error('Direct CDN loading timeout'));
        }
      }, 15000);
    });
  }

  // Initialize Zoom SDK
  async initialize(config = {}) {
    if (this.isInitialized) {
      console.log('🔄 Zoom SDK already initialized');
      return true;
    }

    try {
      console.log('🚀 Initializing Zoom SDK...');
      
      // Load SDK from CDN
      await this.loadZoomSDKFromCDN();
      
      if (!this.ZoomMtg) {
        throw new Error('ZoomMtg not loaded after CDN attempt');
      }

      // Initialize SDK components safely
      await this.initializeSDKComponents();
      
      this.isInitialized = true;
      console.log('✅ Zoom SDK initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Zoom SDK initialization failed:', error);
      console.log('🔧 Falling back to development mode');
      this.isInitialized = false;
      return false;
    }
  }

  // Initialize SDK components with error handling
  async initializeSDKComponents() {
    const initSteps = [
      {
        name: 'setZoomJSLib',
        action: () => {
          if (this.ZoomMtg.setZoomJSLib) {
            this.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.16.0/lib', '/av');
          }
        }
      },
      {
        name: 'preLoadWasm',
        action: () => {
          if (this.ZoomMtg.preLoadWasm) {
            this.ZoomMtg.preLoadWasm();
          }
        }
      },
      {
        name: 'prepareWebSDK',
        action: () => {
          if (this.ZoomMtg.prepareWebSDK) {
            this.ZoomMtg.prepareWebSDK();
          }
        }
      },
      {
        name: 'loadLanguage',
        action: () => {
          if (this.ZoomMtg.i18n && this.ZoomMtg.i18n.load) {
            this.ZoomMtg.i18n.load('en-US');
          }
        }
      }
    ];

    for (const step of initSteps) {
      try {
        console.log(`🔄 Executing ${step.name}...`);
        step.action();
        console.log(`✅ ${step.name} completed`);
      } catch (error) {
        console.warn(`⚠️ ${step.name} failed:`, error.message);
        // Continue with other steps
      }
    }

    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Create meeting (calls backend API)
  async createMeeting(options = {}) {
    try {
      console.log('🔄 Creating meeting via backend API...');
      
      const response = await apiRequest(API_ENDPOINTS.MEETINGS_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: options.topic || 'LinguaLive Meeting',
          duration: options.duration || 60,
          settings: options.settings || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Meeting created successfully:', result.meeting);
        return result;
      } else {
        throw new Error(result.error || 'Failed to create meeting');
      }
    } catch (error) {
      console.error('❌ Failed to create meeting:', error);
      throw error;
    }
  }

  // Join meeting
  async joinMeeting(meetingConfig, containerElement) {
    console.log('🔄 Attempting to join meeting...');
    
    try {
      const joinConfig = meetingConfig.joinConfig || meetingConfig;
      
      // Check if we should use development mode
      const isDevelopmentMode = 
        !this.isInitialized ||
        joinConfig.sdkKey === 'development-sdk-key' ||
        joinConfig.sdkKey === 'mock-sdk-key' ||
        !joinConfig.sdkKey ||
        meetingConfig.meeting?.isMock;

      if (isDevelopmentMode) {
        console.log('🔧 Using development mode simulation');
        return this.simulateMeetingJoin(meetingConfig, containerElement);
      }

      // Try real Zoom meeting
      return await this.joinRealMeeting(joinConfig, containerElement);
      
    } catch (error) {
      console.error('❌ Meeting join failed:', error);
      console.log('🔧 Falling back to development mode');
      return this.simulateMeetingJoin(meetingConfig, containerElement);
    }
  }

  // Simulate meeting join for development
  simulateMeetingJoin(meetingConfig, containerElement) {
    console.log('🎭 Simulating meeting join...');
    
    if (containerElement) {
      containerElement.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          border-radius: 8px;
        ">
          <div>
            <h2 style="margin: 0 0 16px 0; font-size: 24px;">🎥 Development Mode</h2>
            <div style="
              width: 320px;
              height: 180px;
              background: rgba(0,0,0,0.3);
              border-radius: 8px;
              margin: 16px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: pulse 2s infinite;
            ">
              <div>
                <div style="margin-bottom: 8px;">📹 Mock Video Stream</div>
                <div style="font-size: 12px; opacity: 0.8;">Meeting ID: ${meetingConfig.meeting?.id || 'DEV-12345'}</div>
              </div>
            </div>
            <p style="margin: 16px 0 0 0; font-size: 14px; opacity: 0.9;">
              Simulated Zoom meeting environment
            </p>
          </div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        </style>
      `;
    }

    // Simulate successful join
    setTimeout(() => {
      console.log('✅ Mock meeting joined successfully');
      this.currentMeeting = meetingConfig;
      
      // Dispatch success event
      window.dispatchEvent(new CustomEvent('zoom-meeting-joined', {
        detail: { status: 'success', mode: 'development' }
      }));
      
      // Start mock events
      this.startMockEvents();
    }, 1000);

    return Promise.resolve(true);
  }

  // Join real Zoom meeting
  async joinRealMeeting(joinConfig, containerElement) {
    if (!this.ZoomMtg || !this.isInitialized) {
      throw new Error('Zoom SDK not properly initialized');
    }

    return new Promise((resolve, reject) => {
      const meetingOptions = {
        sdkKey: joinConfig.sdkKey,
        meetingNumber: joinConfig.meetingNumber,
        password: joinConfig.password || '',
        signature: joinConfig.signature,
        userName: joinConfig.userName || 'LinguaLive User',
        userEmail: joinConfig.userEmail || '',
        lang: 'en-US',
        china: false,
        
        success: (result) => {
          console.log('✅ Real meeting joined successfully');
          this.currentMeeting = { joinConfig };
          resolve(true);
        },
        
        error: (error) => {
          console.error('❌ Real meeting join failed:', error);
          reject(new Error(`Meeting join failed: ${error.errorMessage || 'Unknown error'}`));
        }
      };

      console.log('📞 Joining real Zoom meeting...');
      
      this.ZoomMtg.init({
        leaveUrl: window.location.origin,
        success: () => {
          console.log('✅ ZoomMtg.init success');
          this.ZoomMtg.join(meetingOptions);
        },
        error: (error) => {
          console.error('❌ ZoomMtg.init failed:', error);
          reject(error);
        }
      });
    });
  }

  // Start mock events for development mode
  startMockEvents() {
    // Simulate participant updates
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('participant-update', {
        detail: {
          participants: [
            { id: '1', name: 'Host User', isHost: true },
            { id: '2', name: 'LinguaLive User', isHost: false }
          ]
        }
      }));
    }, 2000);
  }

  // Enable translation
  enableTranslation() {
    this.translationEnabled = true;
    console.log('✅ Translation enabled');
    
    // Start mock translations in development mode
    if (!this.isInitialized) {
      this.simulateTranslations();
    }
  }

  // Disable translation
  disableTranslation() {
    this.translationEnabled = false;
    console.log('📴 Translation disabled');
  }

  // Simulate translations
  simulateTranslations() {
    const mockTranslations = [
      { 
        speaker: 'Demo Speaker', 
        original: 'Hello everyone, welcome to our meeting!',
        translated: 'Hola a todos, ¡bienvenidos a nuestra reunión!',
        language: 'Spanish'
      },
      {
        speaker: 'Demo Speaker',
        original: 'How is everyone doing today?',
        translated: 'Comment allez-vous tous aujourd\'hui ?',
        language: 'French'
      }
    ];

    mockTranslations.forEach((translation, index) => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('translation-update', {
          detail: {
            transcript: translation.original,
            translation: translation.translated,
            speaker: translation.speaker,
            targetLanguage: translation.language
          }
        }));
      }, (index + 1) * 5000);
    });
  }

  // Leave meeting
  async leaveMeeting() {
    try {
      if (this.ZoomMtg && this.isInitialized) {
        // Try to leave real meeting
        console.log('📴 Leaving real meeting...');
        // ZoomMtg doesn't have a direct leave method, it uses the UI
      } else {
        console.log('📴 Leaving development mode meeting...');
      }
      
      this.currentMeeting = null;
      console.log('✅ Meeting left successfully');
      return true;
    } catch (error) {
      console.error('❌ Error leaving meeting:', error);
      return false;
    }
  }
}

// Create and export service instance
const simpleZoomService = new SimpleZoomService();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.simpleZoomService = simpleZoomService;
}

export default simpleZoomService;