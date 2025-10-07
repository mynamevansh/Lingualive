// Background service worker for message passing and coordination
class LinguaLiveBackground {
  constructor() {
    this.setupMessageHandlers();
    this.setupContextMenus();
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    chrome.runtime.onConnect.addListener((port) => {
      this.handlePortConnection(port);
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'START_TRANSLATION':
          await this.handleStartTranslation(message, sender);
          sendResponse({ success: true });
          break;
          
        case 'STOP_TRANSLATION':
          await this.handleStopTranslation(message, sender);
          sendResponse({ success: true });
          break;
          
        case 'UPDATE_SETTINGS':
          await this.handleUpdateSettings(message.settings);
          sendResponse({ success: true });
          break;
          
        case 'GET_SETTINGS':
          const settings = await this.getSettings();
          sendResponse({ settings });
          break;
          
        case 'SAVE_MEETING_SUMMARY':
          await this.saveMeetingSummary(message.data);
          sendResponse({ success: true });
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Background message error:', error);
      sendResponse({ error: error.message });
    }
  }

  handlePortConnection(port) {
    if (port.name === 'translation-stream') {
      port.onMessage.addListener((message) => {
        // Forward translation data to all connected tabs
        this.broadcastToTabs(message);
      });
    }
  }

  async handleStartTranslation(message, sender) {
    const { sourceLanguage, targetLanguage, enableRealTimeNotes } = message;
    
    // Store active translation session
    await chrome.storage.local.set({
      activeTranslation: {
        tabId: sender.tab.id,
        sourceLanguage,
        targetLanguage,
        enableRealTimeNotes,
        startTime: Date.now()
      }
    });

    // Inject content script if not already present
    try {
      await chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        files: ['contentScript.js']
      });
    } catch (error) {
      console.log('Content script already injected or injection failed:', error);
    }
  }

  async handleStopTranslation(message, sender) {
    await chrome.storage.local.remove('activeTranslation');
    
    // Notify content script to stop
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'STOP_TRANSLATION_RESPONSE'
    }).catch(console.error);
  }

  async handleUpdateSettings(settings) {
    await chrome.storage.sync.set({ userSettings: settings });
    
    // Broadcast settings update to all tabs
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SETTINGS_UPDATED',
        settings
      }).catch(() => {}); // Ignore errors for inactive tabs
    }
  }

  async getSettings() {
    const result = await chrome.storage.sync.get('userSettings');
    return result.userSettings || {
      sourceLanguage: 'en',
      targetLanguage: 'es',
      enableRealTimeNotes: true,
      enableProofreading: true,
      subtitlePosition: 'bottom',
      fontSize: 'medium',
      theme: 'dark'
    };
  }

  async saveMeetingSummary(summaryData) {
    const timestamp = Date.now();
    const summaryId = `summary_${timestamp}`;
    
    await chrome.storage.local.set({
      [summaryId]: {
        ...summaryData,
        id: summaryId,
        createdAt: timestamp
      }
    });

    // Also sync to server if connected
    this.syncToServer(summaryData);
  }

  async syncToServer(data) {
    try {
      const settings = await this.getSettings();
      if (settings.serverUrl) {
        await fetch(`${settings.serverUrl}/api/meetings/summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.authToken}`
          },
          body: JSON.stringify(data)
        });
      }
    } catch (error) {
      console.error('Failed to sync to server:', error);
    }
  }

  async broadcastToTabs(message) {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {});
    }
  }

  setupContextMenus() {
    chrome.contextMenus.create({
      id: 'lingualive-translate',
      title: 'Translate with LinguaLive',
      contexts: ['selection']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'lingualive-translate') {
        chrome.tabs.sendMessage(tab.id, {
          type: 'TRANSLATE_SELECTION',
          text: info.selectionText
        });
      }
    });
  }
}

// Initialize the background service
new LinguaLiveBackground();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup/index.html') + '?welcome=true'
    });
  }
});