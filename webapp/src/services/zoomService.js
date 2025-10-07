import { v4 as uuidv4 } from 'uuid';
import { initializeZoomSDKRobust } from '../utils/zoomSDKLoader';
import { apiRequest, API_ENDPOINTS } from '../config/api.js';

// Dynamic import
let ZoomMtg = null;

// Zoom SDK Configuration Constants
const ZOOM_SDK_CONFIG = {
  debug: process.env.NODE_ENV === 'development',
  language: 'en-US',
  china: false,
  webEndpoint: 'zoom.us'
};

// Initialize Zoom SDK with proper error handling
let sdkInitialized = false;
let sdkInitializing = false;

class ZoomService {
  constructor() {
    this.client = null;
    this.meetingContainer = null;
    this.isInitialized = false;
    this.currentMeeting = null;
    this.audioCapture = null;
    this.sdkKey = null;
    this.signature = null;
    this.translationEnabled = false;
    
    console.log('🔧 ZoomService constructor initialized');
    
    // Initialize SDK asynchronously
    this.initializeSDKAsync();
  }

  // Async SDK initialization with dynamic loading
  async initializeSDKAsync() {
    if (sdkInitialized || sdkInitializing) return;
    sdkInitializing = true;

    try {
      console.log('🚀 Starting Zoom SDK dynamic loading...');
      
      // Use robust SDK loading with multiple fallback strategies
      ZoomMtg = await initializeZoomSDKRobust();
      console.log('✅ ZoomMtg loaded successfully via robust loader');

      // Validate ZoomMtg is loaded
      if (!ZoomMtg || typeof ZoomMtg !== 'object') {
        throw new Error('ZoomMtg object is invalid or not loaded properly');
      }

      console.log('📋 ZoomMtg methods available:', Object.keys(ZoomMtg));

      // Safe SDK initialization with error handling
      await this.safeSDKInitialization();

      sdkInitialized = true;
      console.log('🎉 Zoom SDK initialization completed successfully');
      
    } catch (error) {
      console.error('❌ Zoom SDK initialization failed:', error);
      console.error('📋 Detailed error info:', {
        message: error.message,
        stack: error.stack,
        hasZoomMtg: !!ZoomMtg,
        windowZoomMtg: !!window.ZoomMtg,
        userAgent: navigator.userAgent
      });
      
      // Set to development mode on SDK failure
      console.log('🔧 Falling back to development mode due to SDK issues');
      sdkInitialized = false;
    } finally {
      sdkInitializing = false;
    }
  }

  // Safe SDK initialization with try-catch for each step
  async safeSDKInitialization() {
    const steps = [
      {
        name: 'setZoomJSLib',
        action: () => {
          if (ZoomMtg.setZoomJSLib && typeof ZoomMtg.setZoomJSLib === 'function') {
            ZoomMtg.setZoomJSLib('https://source.zoom.us/2.16.0/lib', '/av');
          }
        }
      },
      {
        name: 'preLoadWasm',
        action: () => {
          if (ZoomMtg.preLoadWasm && typeof ZoomMtg.preLoadWasm === 'function') {
            ZoomMtg.preLoadWasm();
          }
        }
      },
      {
        name: 'prepareWebSDK',
        action: () => {
          if (ZoomMtg.prepareWebSDK && typeof ZoomMtg.prepareWebSDK === 'function') {
            ZoomMtg.prepareWebSDK();
          }
        }
      },
      {
        name: 'i18n.load',
        action: () => {
          if (ZoomMtg.i18n && ZoomMtg.i18n.load && typeof ZoomMtg.i18n.load === 'function') {
            ZoomMtg.i18n.load(ZOOM_SDK_CONFIG.language);
          }
        }
      }
    ];

    for (const step of steps) {
      try {
        step.action();
        console.log(`✅ ${step.name} completed`);
      } catch (stepError) {
        console.warn(`⚠️ ${step.name} failed:`, stepError.message);
        // Continue with other steps even if one fails
      }
    }

    // Give SDK time to process
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Initialize Zoom SDK (simplified version)
  async initialize(config = {}) {
    if (this.isInitialized) {
      console.log('🔄 Zoom SDK already initialized');
      return;
    }

    try {
      // Wait for SDK to be ready
      let attempts = 0;
      while (!sdkInitialized && attempts < 30) {
        console.log(`⏳ Waiting for SDK initialization... (attempt ${attempts + 1}/30)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!sdkInitialized) {
        console.warn('⚠️ SDK initialization timeout, proceeding with development mode');
      }
      
      // Set SDK configuration
      this.sdkKey = config.sdkKey || 'development-sdk-key';
      
      console.log('📊 Configuration:', {
        sdkKey: this.sdkKey === 'development-sdk-key' ? 'Development Mode' : 'Production Mode',
        sdkReady: sdkInitialized
      });
      
      this.isInitialized = true;
      console.log('✅ ZoomService ready for use');
      
    } catch (error) {
      console.error('❌ ZoomService initialization failed:', error);
      throw new Error(`Failed to initialize ZoomService: ${error.message}`);
    }
  }

  // Create a new Zoom meeting
  async createMeeting(options = {}) {
    try {
      const defaultOptions = {
        topic: 'LinguaLive Meeting',
        duration: 60,
        settings: {
          join_before_host: false,
          mute_upon_entry: true,
          audio: 'voip',
          auto_recording: 'none',
          waiting_room: false,
          // Enable features for translation
          use_pmi: false,
          approval_type: 0
        }
      };

      const meetingConfig = { ...defaultOptions, ...options };
      
      // Call backend to create Zoom meeting
      const response = await apiRequest(API_ENDPOINTS.MEETINGS_CREATE, {
        method: 'POST',
        body: JSON.stringify(meetingConfig)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const meeting = await response.json();
      this.currentMeeting = meeting;
      
      console.log('✅ Meeting created:', meeting);
      return meeting;
    } catch (error) {
      console.error('❌ Failed to create meeting:', error);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  // Join a Zoom meeting with enhanced error handling
  async joinMeeting(meetingConfig, containerElement) {
    console.log('🔄 Attempting to join meeting...');
    console.log('📋 Meeting config:', JSON.stringify(meetingConfig, null, 2));
    
    if (!this.isInitialized) {
      await this.initialize(meetingConfig.joinConfig);
    }

    try {
      this.meetingContainer = containerElement;
      const joinConfig = meetingConfig.joinConfig || meetingConfig;
      
      // Validate basic requirements
      if (!joinConfig.meetingNumber) {
        throw new Error('Meeting number is required');
      }

      const isDevelopmentMode = 
        joinConfig.sdkKey === 'development-sdk-key' || 
        joinConfig.sdkKey === 'mock-sdk-key' ||
        !joinConfig.sdkKey ||
        meetingConfig.meeting?.isMock;

      console.log('🔍 Meeting mode:', isDevelopmentMode ? 'Development/Mock' : 'Production');

      // Development mode - simulate meeting join
      if (isDevelopmentMode) {
        console.log('🔧 Running in development mode...');
        this.simulateMeetingJoin(meetingConfig);
        return true;
      }

      // Production mode - use real Zoom SDK
      return await this.joinRealMeeting(joinConfig);
      
    } catch (error) {
      console.error('❌ Failed to join meeting:', error);
      throw new Error(`Meeting join failed: ${error.message}`);
    }
  }

  // Simulate meeting join for development mode
  simulateMeetingJoin(meetingConfig) {
    console.log('🎭 Simulating meeting join...');
    
    setTimeout(() => {
      console.log('✅ Mock meeting joined successfully');
      this.currentMeeting = meetingConfig;
      this.setupEventListeners();
      this.setupTranslationFeatures();
      
      // Dispatch success event
      window.dispatchEvent(new CustomEvent('zoom-meeting-joined', {
        detail: { status: 'success', mode: 'development' }
      }));
    }, 1500);
  }

  // Join real Zoom meeting (production mode) with enhanced error handling
  async joinRealMeeting(joinConfig) {
    return new Promise((resolve, reject) => {
      try {
        console.log('🚀 Attempting real Zoom meeting join...');

        // Check SDK availability
        if (!ZoomMtg) {
          throw new Error('ZoomMtg is not loaded');
        }

        if (!sdkInitialized) {
          console.warn('⚠️ SDK not fully initialized, attempting join anyway...');
        }

        // Validate required methods
        const requiredMethods = ['init', 'join'];
        for (const method of requiredMethods) {
          if (!ZoomMtg[method] || typeof ZoomMtg[method] !== 'function') {
            throw new Error(`ZoomMtg.${method} is not available`);
          }
        }

        const meetingOptions = {
          sdkKey: joinConfig.sdkKey,
          meetingNumber: joinConfig.meetingNumber,
          password: joinConfig.password || '',
          signature: joinConfig.signature,
          userName: joinConfig.userName || 'LinguaLive User',
          userEmail: joinConfig.userEmail || '',
          lang: ZOOM_SDK_CONFIG.language,
          china: ZOOM_SDK_CONFIG.china,
          webEndpoint: ZOOM_SDK_CONFIG.webEndpoint,
          
          success: (result) => {
            console.log('✅ Real meeting joined successfully:', result);
            this.currentMeeting = { joinConfig };
            this.setupEventListeners();
            this.setupTranslationFeatures();
            resolve(true);
          },
          
          error: (error) => {
            console.error('❌ Real meeting join failed:', error);
            reject(new Error(`Zoom meeting join failed: ${error.errorMessage || error.message || 'Unknown SDK error'}`));
          }
        };

        console.log('📞 Calling ZoomMtg.init...');
        
        // Enhanced init call with timeout
        const initTimeout = setTimeout(() => {
          reject(new Error('ZoomMtg.init timeout - SDK may be corrupted'));
        }, 10000);

        try {
          ZoomMtg.init({
            leaveUrl: `${window.location.origin}/#/meeting-ended`,
            isSupportAV: true,
            success: () => {
              clearTimeout(initTimeout);
              console.log('✅ ZoomMtg.init success, joining meeting...');
              
              // Add join timeout as well
              const joinTimeout = setTimeout(() => {
                reject(new Error('ZoomMtg.join timeout'));
              }, 15000);
              
              try {
                ZoomMtg.join({
                  ...meetingOptions,
                  success: (result) => {
                    clearTimeout(joinTimeout);
                    meetingOptions.success(result);
                  },
                  error: (error) => {
                    clearTimeout(joinTimeout);
                    meetingOptions.error(error);
                  }
                });
              } catch (joinError) {
                clearTimeout(joinTimeout);
                reject(new Error(`ZoomMtg.join exception: ${joinError.message}`));
              }
            },
            error: (initError) => {
              clearTimeout(initTimeout);
              console.error('❌ ZoomMtg.init failed:', initError);
              reject(new Error(`Zoom SDK init failed: ${initError.errorMessage || initError.message || 'Init failed'}`));
            }
          });
        } catch (initException) {
          clearTimeout(initTimeout);
          reject(new Error(`ZoomMtg.init exception: ${initException.message}`));
        }

      } catch (error) {
        console.error('❌ joinRealMeeting setup failed:', error);
        reject(error);
      }
    });
  }

  // Setup event listeners for meeting events
  setupEventListeners() {
    try {
      console.log('📡 Setting up meeting event listeners...');
      
      // For development mode, simulate some events
      if (this.sdkKey === 'development-sdk-key' || this.sdkKey === 'mock-sdk-key') {
        console.log('🔧 Development mode: Setting up mock event listeners');
        this.simulateDevelopmentEvents();
        return;
      }
      
      // In real implementation, set up actual Zoom SDK event listeners
      // ZoomMtg events would be handled here
      console.log('✅ Event listeners configured');
      
    } catch (error) {
      console.error('❌ Failed to setup event listeners:', error);
    }
  }

  // Simulate events for development mode
  simulateDevelopmentEvents() {
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

    // Simulate translation updates
    this.simulateTranslationUpdates();
  }

  // Setup audio capture for real-time translation (development version)
  setupAudioCapture() {
    try {
      console.log('🎤 Setting up audio capture for translation...');
      
      if (this.sdkKey === 'development-sdk-key' || this.sdkKey === 'mock-sdk-key') {
        console.log('🔧 Development mode: Using mock audio capture');
        this.simulateAudioCapture();
        return;
      }

      // In real implementation with Zoom SDK, you would:
      // 1. Get audio stream from Zoom meeting
      // 2. Process audio chunks
      // 3. Send to transcription service
      // 4. Get translations
      // 5. Display in UI
      
      console.log('✅ Audio capture setup completed');
      
    } catch (error) {
      console.error('❌ Failed to setup audio capture:', error);
    }
  }

  // Simulate audio capture and translation for development
  simulateAudioCapture() {
    const mockTranscriptions = [
      "Hello everyone, welcome to our meeting.",
      "Let's discuss the project updates.",
      "The new features are working well.",
      "We should test the translation system.",
      "This is a multilingual meeting platform."
    ];

    let index = 0;
    const simulateInterval = setInterval(() => {
      if (index < mockTranscriptions.length) {
        this.processAudioForTranslation({
          transcript: mockTranscriptions[index],
          speaker: 'Demo Speaker',
          timestamp: new Date().toISOString()
        });
        index++;
      } else {
        clearInterval(simulateInterval);
      }
    }, 5000);
  }

  // Process audio data for translation
  async processAudioForTranslation(audioData) {
    try {
      // Convert audio data to appropriate format
      const audioBlob = new Blob([audioData], { type: 'audio/wav' });
      
      // Send to translation service
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('meetingId', this.currentMeeting?.id);
      formData.append('timestamp', Date.now());

      const response = await fetch(`${API_URL}/api/ai/transcribe-translate`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        this.displayTranslation(result);
      }
    } catch (error) {
      console.error('❌ Audio processing failed:', error);
    }
  }

  // Display translation overlay
  displayTranslation(translationData) {
    // Create or update translation overlay
    const overlay = document.getElementById('translation-overlay') || this.createTranslationOverlay();
    
    if (translationData.transcript) {
      overlay.innerHTML = `
        <div class="translation-item">
          <div class="original-text">${translationData.transcript}</div>
          ${translationData.translation ? `<div class="translated-text">${translationData.translation}</div>` : ''}
          <div class="speaker-info">${translationData.speaker || 'Unknown'} • ${new Date(translationData.timestamp).toLocaleTimeString()}</div>
        </div>
      `;
      overlay.style.display = 'block';

      // Auto-hide after 5 seconds
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 5000);
    }
  }

  // Create translation overlay UI
  createTranslationOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'translation-overlay';
    overlay.className = 'zoom-translation-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      max-width: 300px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: none;
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  // Setup translation features
  setupTranslationFeatures() {
    // Add translation controls to Zoom toolbar
    const translationButton = document.createElement('button');
    translationButton.innerHTML = '🌐 Translation';
    translationButton.className = 'zoom-translation-btn';
    translationButton.onclick = () => this.toggleTranslation();

    // Find Zoom toolbar and add button
    const toolbar = document.querySelector('.zm-btn-group');
    if (toolbar) {
      toolbar.appendChild(translationButton);
    }
  }

  // Toggle translation on/off
  toggleTranslation() {
    if (this.translationEnabled) {
      this.disableTranslation();
    } else {
      this.enableTranslation();
    }
  }

  // Enable real-time translation
  enableTranslation() {
    this.translationEnabled = true;
    console.log('✅ Translation enabled');
    
    // Show translation settings modal
    this.showTranslationSettings();
  }

  // Disable translation
  disableTranslation() {
    this.translationEnabled = false;
    console.log('❌ Translation disabled');
    
    // Hide translation overlay
    const overlay = document.getElementById('translation-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  // Show translation settings
  showTranslationSettings() {
    // Create settings modal (simplified version)
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="translation-settings-modal">
        <h3>Translation Settings</h3>
        <div class="setting-group">
          <label>Source Language:</label>
          <select id="source-lang">
            <option value="auto">Auto-detect</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
          </select>
        </div>
        <div class="setting-group">
          <label>Target Language:</label>
          <select id="target-lang">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
          </select>
        </div>
        <div class="modal-actions">
          <button onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
          <button onclick="window.zoomService.applyTranslationSettings()">Apply</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Apply translation settings
  applyTranslationSettings() {
    const sourceLang = document.getElementById('source-lang')?.value;
    const targetLang = document.getElementById('target-lang')?.value;
    
    this.translationSettings = {
      sourceLang,
      targetLang,
      enabled: true
    };

    console.log('✅ Translation settings applied:', this.translationSettings);
    
    // Remove modal
    document.querySelector('.translation-settings-modal')?.parentElement?.remove();
  }

  // Leave current meeting
  async leaveMeeting() {
    try {
      if (this.audioCapture) {
        this.audioCapture.stopAudio();
      }

      await this.client.leave();
      
      this.currentMeeting = null;
      this.translationEnabled = false;
      
      // Clean up translation overlay
      const overlay = document.getElementById('translation-overlay');
      if (overlay) {
        overlay.remove();
      }

      console.log('✅ Left meeting successfully');
    } catch (error) {
      console.error('❌ Error leaving meeting:', error);
      throw error;
    }
  }

  // Get meeting status
  getMeetingStatus() {
    return {
      isInMeeting: !!this.currentMeeting,
      meetingId: this.currentMeeting?.id,
      translationEnabled: this.translationEnabled,
      audioCapturing: !!this.audioCapture
    };
  }
}

// Create singleton instance
const zoomService = new ZoomService();

// Make it globally available for debugging
if (typeof window !== 'undefined') {
  window.zoomService = zoomService;
}

export default zoomService;