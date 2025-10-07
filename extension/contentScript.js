// Content script for injecting real-time translation overlay
class LinguaLiveContentScript {
  constructor() {
    this.isActive = false;
    this.recognition = null;
    this.translationOverlay = null;
    this.settings = {};
    this.currentStream = null;
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupMessageHandlers();
    this.detectMeetingPlatform();
    
    // Check if translation should auto-start
    const activeTranslation = await this.getActiveTranslation();
    if (activeTranslation) {
      this.startTranslation(activeTranslation);
    }
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
        this.settings = response.settings || {};
        resolve();
      });
    });
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true;
    });
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'START_TRANSLATION_RESPONSE':
        await this.startTranslation(message);
        sendResponse({ success: true });
        break;
        
      case 'STOP_TRANSLATION_RESPONSE':
        this.stopTranslation();
        sendResponse({ success: true });
        break;
        
      case 'SETTINGS_UPDATED':
        this.settings = message.settings;
        this.updateOverlaySettings();
        sendResponse({ success: true });
        break;
        
      case 'TRANSLATE_SELECTION':
        await this.translateSelection(message.text);
        sendResponse({ success: true });
        break;
    }
  }

  detectMeetingPlatform() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('meet.google.com')) {
      this.platform = 'googlemeet';
      this.setupGoogleMeetIntegration();
    } else if (hostname.includes('zoom.us')) {
      this.platform = 'zoom';
      this.setupZoomIntegration();
    } else if (hostname.includes('teams.microsoft.com')) {
      this.platform = 'teams';
      this.setupTeamsIntegration();
    } else {
      this.platform = 'generic';
    }
  }

  async startTranslation({ sourceLanguage, targetLanguage, enableRealTimeNotes }) {
    if (this.isActive) return;
    
    this.isActive = true;
    await this.createTranslationOverlay();
    await this.startSpeechRecognition(sourceLanguage);
    
    this.showNotification('LinguaLive translation started', 'success');
  }

  stopTranslation() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
    
    this.removeTranslationOverlay();
    this.showNotification('LinguaLive translation stopped', 'info');
  }

  async createTranslationOverlay() {
    // Remove existing overlay
    this.removeTranslationOverlay();
    
    this.translationOverlay = document.createElement('div');
    this.translationOverlay.id = 'lingualive-overlay';
    this.translationOverlay.innerHTML = `
      <div class="lingualive-container">
        <div class="lingualive-header">
          <div class="lingualive-title">
            <img src="${chrome.runtime.getURL('assets/icon32.png')}" alt="LinguaLive">
            <span>LinguaLive</span>
          </div>
          <div class="lingualive-controls">
            <button id="lingualive-minimize" title="Minimize">−</button>
            <button id="lingualive-close" title="Close">×</button>
          </div>
        </div>
        <div class="lingualive-content">
          <div class="lingualive-subtitles">
            <div class="subtitle-original">
              <label>Original:</label>
              <div class="subtitle-text" id="original-text">Listening...</div>
            </div>
            <div class="subtitle-translated">
              <label>Translated:</label>
              <div class="subtitle-text" id="translated-text">Ready for translation...</div>
            </div>
          </div>
          <div class="lingualive-notes">
            <label>Meeting Notes:</label>
            <div class="notes-content" id="meeting-notes">
              <div class="note-item">Meeting started at ${new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    this.addOverlayStyles();
    
    // Position based on settings
    this.positionOverlay();
    
    // Add event listeners
    this.setupOverlayEventListeners();
    
    document.body.appendChild(this.translationOverlay);
  }

  addOverlayStyles() {
    if (document.getElementById('lingualive-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'lingualive-styles';
    styles.textContent = `
      #lingualive-overlay {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 999999;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: white;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .lingualive-container {
        display: flex;
        flex-direction: column;
      }

      .lingualive-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        cursor: move;
      }

      .lingualive-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
      }

      .lingualive-title img {
        width: 20px;
        height: 20px;
      }

      .lingualive-controls button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 16px;
        margin-left: 4px;
        transition: background 0.2s;
      }

      .lingualive-controls button:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .lingualive-content {
        padding: 16px;
      }

      .lingualive-subtitles {
        margin-bottom: 16px;
      }

      .subtitle-original, .subtitle-translated {
        margin-bottom: 12px;
      }

      .subtitle-original label, .subtitle-translated label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 4px;
        opacity: 0.8;
      }

      .subtitle-text {
        background: rgba(255, 255, 255, 0.1);
        padding: 8px 12px;
        border-radius: 6px;
        min-height: 20px;
        font-size: 14px;
        line-height: 1.4;
      }

      .lingualive-notes label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 8px;
        opacity: 0.8;
      }

      .notes-content {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 12px;
        max-height: 200px;
        overflow-y: auto;
        font-size: 13px;
      }

      .note-item {
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        line-height: 1.4;
      }

      .note-item:last-child {
        margin-bottom: 0;
        border-bottom: none;
        padding-bottom: 0;
      }

      /* Minimized state */
      #lingualive-overlay.minimized {
        width: 200px;
        height: auto;
      }

      #lingualive-overlay.minimized .lingualive-content {
        display: none;
      }

      /* Position variants */
      #lingualive-overlay.position-bottom {
        top: auto;
        bottom: 20px;
      }

      #lingualive-overlay.position-left {
        left: 20px;
        right: auto;
      }

      /* Theme variants */
      #lingualive-overlay.theme-light {
        background: rgba(255, 255, 255, 0.95);
        color: #333;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      #lingualive-overlay.theme-light .lingualive-header {
        background: rgba(0, 0, 0, 0.05);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }

      #lingualive-overlay.theme-light .subtitle-text,
      #lingualive-overlay.theme-light .notes-content {
        background: rgba(0, 0, 0, 0.05);
      }

      /* Animation for new content */
      .subtitle-text.updated {
        animation: highlight 0.3s ease;
      }

      @keyframes highlight {
        0% { background: rgba(76, 175, 80, 0.3); }
        100% { background: rgba(255, 255, 255, 0.1); }
      }
    `;
    
    document.head.appendChild(styles);
  }

  setupOverlayEventListeners() {
    const minimizeBtn = this.translationOverlay.querySelector('#lingualive-minimize');
    const closeBtn = this.translationOverlay.querySelector('#lingualive-close');
    const header = this.translationOverlay.querySelector('.lingualive-header');
    
    minimizeBtn.addEventListener('click', () => {
      this.translationOverlay.classList.toggle('minimized');
    });
    
    closeBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'STOP_TRANSLATION' });
    });
    
    // Make draggable
    this.makeDraggable(header);
  }

  makeDraggable(handle) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    handle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === handle || handle.contains(e.target)) {
        isDragging = true;
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        this.translationOverlay.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    }
  }

  async startSpeechRecognition(language) {
    try {
      // First try to get microphone access
      this.currentStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Check if Chrome built-in AI is available
      if ('ai' in window && 'createTextSession' in window.ai) {
        await this.startBuiltInAIRecognition(language);
      } else {
        // Fallback to Web Speech API
        await this.startWebSpeechRecognition(language);
      }
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.showNotification('Microphone access required for translation', 'error');
    }
  }

  async startBuiltInAIRecognition(language) {
    try {
      // Use Chrome's built-in AI for speech recognition
      const session = await window.ai.createTextSession();
      
      // Set up audio processing
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(this.currentStream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = async (event) => {
        if (!this.isActive) return;
        
        // Process audio data and send to AI
        const audioData = event.inputBuffer.getChannelData(0);
        // This would need actual audio-to-text processing
        // For now, we'll use Web Speech API as fallback
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
    } catch (error) {
      console.log('Built-in AI not available, using Web Speech API');
      await this.startWebSpeechRecognition(language);
    }
  }

  async startWebSpeechRecognition(language) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.showNotification('Speech recognition not supported', 'error');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = language || 'en-US';

    this.recognition.onstart = () => {
      this.updateSubtitleText('original', 'Listening...', false);
    };

    this.recognition.onresult = async (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const displayText = finalTranscript || interimTranscript;
      if (displayText) {
        this.updateSubtitleText('original', displayText, event.results[event.results.length - 1].isFinal);
        
        if (finalTranscript) {
          await this.translateText(finalTranscript);
          await this.generateNotes(finalTranscript);
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        this.showNotification('Microphone permission denied', 'error');
      } else {
        // Auto-restart on most errors
        setTimeout(() => {
          if (this.isActive) {
            this.recognition.start();
          }
        }, 1000);
      }
    };

    this.recognition.onend = () => {
      if (this.isActive) {
        // Auto-restart recognition
        setTimeout(() => {
          this.recognition.start();
        }, 500);
      }
    };

    this.recognition.start();
  }

  updateSubtitleText(type, text, isFinal) {
    const element = document.getElementById(`${type === 'original' ? 'original' : 'translated'}-text`);
    if (element) {
      element.textContent = text;
      if (isFinal) {
        element.classList.add('updated');
        setTimeout(() => element.classList.remove('updated'), 300);
      }
    }
  }

  async translateText(text) {
    try {
      // Try Chrome built-in translation first
      if ('ai' in window && 'translator' in window.ai) {
        const translator = await window.ai.translator.create({
          sourceLanguage: this.settings.sourceLanguage || 'en',
          targetLanguage: this.settings.targetLanguage || 'es'
        });
        
        const translation = await translator.translate(text);
        this.updateSubtitleText('translated', translation, true);
        return;
      }
      
      // Fallback to our translation utility
      const { translateWithBuiltInAI } = await import(chrome.runtime.getURL('utils/translator.js'));
      const translation = await translateWithBuiltInAI(
        text, 
        this.settings.sourceLanguage || 'en',
        this.settings.targetLanguage || 'es'
      );
      
      this.updateSubtitleText('translated', translation, true);
      
    } catch (error) {
      console.error('Translation error:', error);
      this.updateSubtitleText('translated', 'Translation failed', true);
    }
  }

  async generateNotes(text) {
    if (!this.settings.enableRealTimeNotes) return;
    
    try {
      const { generateSummaryWithBuiltInAI } = await import(chrome.runtime.getURL('utils/summarizer.js'));
      const note = await generateSummaryWithBuiltInAI(text);
      
      if (note) {
        this.addMeetingNote(note);
      }
    } catch (error) {
      console.error('Note generation error:', error);
    }
  }

  addMeetingNote(note) {
    const notesContainer = document.getElementById('meeting-notes');
    if (notesContainer) {
      const noteElement = document.createElement('div');
      noteElement.className = 'note-item';
      noteElement.innerHTML = `
        <span class="note-timestamp">${new Date().toLocaleTimeString()}</span>
        <span class="note-content">${note}</span>
      `;
      
      notesContainer.appendChild(noteElement);
      notesContainer.scrollTop = notesContainer.scrollHeight;
    }
  }

  async translateSelection(text) {
    try {
      const translation = await this.translateText(text);
      // Show translation in a small popup
      this.showTranslationPopup(text, translation);
    } catch (error) {
      console.error('Selection translation error:', error);
    }
  }

  showTranslationPopup(original, translated) {
    const popup = document.createElement('div');
    popup.className = 'lingualive-translation-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-header">Quick Translation</div>
        <div class="popup-text">
          <div><strong>Original:</strong> ${original}</div>
          <div><strong>Translated:</strong> ${translated}</div>
        </div>
        <button class="popup-close">×</button>
      </div>
    `;
    
    // Add popup styles
    const styles = `
      .lingualive-translation-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        z-index: 1000000;
        max-width: 400px;
        font-family: 'Segoe UI', sans-serif;
      }
      
      .popup-header {
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 16px;
      }
      
      .popup-text div {
        margin-bottom: 8px;
        line-height: 1.4;
      }
      
      .popup-close {
        position: absolute;
        top: 8px;
        right: 12px;
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(popup);
    
    popup.querySelector('.popup-close').addEventListener('click', () => {
      document.body.removeChild(popup);
      document.head.removeChild(styleSheet);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(popup)) {
        document.body.removeChild(popup);
        document.head.removeChild(styleSheet);
      }
    }, 5000);
  }

  removeTranslationOverlay() {
    if (this.translationOverlay) {
      this.translationOverlay.remove();
      this.translationOverlay = null;
    }
  }

  positionOverlay() {
    if (!this.translationOverlay) return;
    
    this.translationOverlay.className = '';
    
    if (this.settings.subtitlePosition === 'bottom') {
      this.translationOverlay.classList.add('position-bottom');
    }
    
    if (this.settings.subtitlePosition === 'left') {
      this.translationOverlay.classList.add('position-left');
    }
    
    if (this.settings.theme === 'light') {
      this.translationOverlay.classList.add('theme-light');
    }
  }

  updateOverlaySettings() {
    this.positionOverlay();
    // Update other settings as needed
  }

  showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `lingualive-notification notification-${type}`;
    notification.textContent = message;
    
    const styles = `
      .lingualive-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        z-index: 1000001;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .notification-success { border-left: 4px solid #4caf50; }
      .notification-error { border-left: 4px solid #f44336; }
      .notification-info { border-left: 4px solid #2196f3; }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
        document.head.removeChild(styleSheet);
      }
    }, 3000);
  }

  async getActiveTranslation() {
    return new Promise((resolve) => {
      chrome.storage.local.get('activeTranslation', (result) => {
        resolve(result.activeTranslation);
      });
    });
  }

  // Platform-specific integrations
  setupGoogleMeetIntegration() {
    // Integrate with Google Meet's interface
    console.log('Google Meet integration active');
  }

  setupZoomIntegration() {
    // Integrate with Zoom's interface
    console.log('Zoom integration active');
  }

  setupTeamsIntegration() {
    // Integrate with Microsoft Teams' interface
    console.log('Teams integration active');
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new LinguaLiveContentScript();
  });
} else {
  new LinguaLiveContentScript();
}