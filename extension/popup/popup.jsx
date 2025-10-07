const { useState, useEffect, useRef } = React;

// Main Popup Component
function LinguaLivePopup() {
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState({
    sourceLanguage: 'en',
    targetLanguage: 'es',
    enableRealTimeNotes: true,
    enableProofreading: true,
    subtitlePosition: 'bottom',
    fontSize: 'medium',
    theme: 'dark',
    serverUrl: 'http://localhost:3001',
    authToken: ''
  });
  const [currentTab, setCurrentTab] = useState('main');
  const [isLoading, setIsLoading] = useState(true);
  const [meetingSummaries, setMeetingSummaries] = useState([]);

  useEffect(() => {
    initializePopup();
  }, []);

  const initializePopup = async () => {
    try {
      // Load settings
      const response = await sendMessage({ type: 'GET_SETTINGS' });
      if (response.settings) {
        setSettings(response.settings);
      }

      // Check if translation is active
      const activeTranslation = await chrome.storage.local.get('activeTranslation');
      setIsActive(!!activeTranslation.activeTranslation);

      // Load meeting summaries
      await loadMeetingSummaries();

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      setIsLoading(false);
    }
  };

  const sendMessage = (message) => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  };

  const loadMeetingSummaries = async () => {
    try {
      const storage = await chrome.storage.local.get();
      const summaries = Object.entries(storage)
        .filter(([key]) => key.startsWith('summary_'))
        .map(([_, summary]) => summary)
        .sort((a, b) => b.createdAt - a.createdAt);
      
      setMeetingSummaries(summaries);
    } catch (error) {
      console.error('Failed to load meeting summaries:', error);
    }
  };

  const toggleTranslation = async () => {
    if (isActive) {
      await sendMessage({ type: 'STOP_TRANSLATION' });
      setIsActive(false);
    } else {
      await sendMessage({
        type: 'START_TRANSLATION',
        sourceLanguage: settings.sourceLanguage,
        targetLanguage: settings.targetLanguage,
        enableRealTimeNotes: settings.enableRealTimeNotes
      });
      setIsActive(true);
    }
  };

  const updateSettings = async (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: updatedSettings
    });
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading LinguaLive...</p>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab}
        isActive={isActive}
      />
      
      {currentTab === 'main' && (
        <MainPanel
          isActive={isActive}
          settings={settings}
          onToggle={toggleTranslation}
          onSettingsChange={updateSettings}
        />
      )}
      
      {currentTab === 'history' && (
        <HistoryPanel
          summaries={meetingSummaries}
          onRefresh={loadMeetingSummaries}
        />
      )}
      
      {currentTab === 'settings' && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={updateSettings}
        />
      )}
    </div>
  );
}

// Header Component
function Header({ currentTab, setCurrentTab, isActive }) {
  return (
    <div className="header">
      <div className="logo">
        <img src="../assets/icon32.png" alt="LinguaLive" />
        <span>LinguaLive</span>
        {isActive && <div className="status-indicator active"></div>}
      </div>
      
      <nav className="tabs">
        <button 
          className={currentTab === 'main' ? 'active' : ''}
          onClick={() => setCurrentTab('main')}
        >
          Main
        </button>
        <button 
          className={currentTab === 'history' ? 'active' : ''}
          onClick={() => setCurrentTab('history')}
        >
          History
        </button>
        <button 
          className={currentTab === 'settings' ? 'active' : ''}
          onClick={() => setCurrentTab('settings')}
        >
          Settings
        </button>
      </nav>
    </div>
  );
}

// Main Panel Component
function MainPanel({ isActive, settings, onToggle, onSettingsChange }) {
  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi'
  };

  return (
    <div className="main-panel">
      <div className="translation-control">
        <div className="language-selector">
          <div className="language-input">
            <label>From:</label>
            <select 
              value={settings.sourceLanguage}
              onChange={(e) => onSettingsChange({ sourceLanguage: e.target.value })}
            >
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="swap-languages"
            onClick={() => onSettingsChange({
              sourceLanguage: settings.targetLanguage,
              targetLanguage: settings.sourceLanguage
            })}
          >
            ⇄
          </button>
          
          <div className="language-input">
            <label>To:</label>
            <select 
              value={settings.targetLanguage}
              onChange={(e) => onSettingsChange({ targetLanguage: e.target.value })}
            >
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          className={`toggle-btn ${isActive ? 'active' : ''}`}
          onClick={onToggle}
        >
          {isActive ? (
            <>
              <span className="icon">⏹</span>
              Stop Translation
            </>
          ) : (
            <>
              <span className="icon">▶</span>
              Start Translation
            </>
          )}
        </button>
      </div>

      <div className="features">
        <div className="feature-toggle">
          <label>
            <input 
              type="checkbox"
              checked={settings.enableRealTimeNotes}
              onChange={(e) => onSettingsChange({ enableRealTimeNotes: e.target.checked })}
            />
            <span className="checkmark"></span>
            Real-time Meeting Notes
          </label>
        </div>
        
        <div className="feature-toggle">
          <label>
            <input 
              type="checkbox"
              checked={settings.enableProofreading}
              onChange={(e) => onSettingsChange({ enableProofreading: e.target.checked })}
            />
            <span className="checkmark"></span>
            Grammar Proofreading
          </label>
        </div>
      </div>

      <div className="quick-actions">
        <button 
          className="action-btn"
          onClick={() => window.open(settings.serverUrl, '_blank')}
        >
          Open Web App
        </button>
        
        <button 
          className="action-btn secondary"
          onClick={() => chrome.tabs.create({ url: 'https://github.com/yourusername/lingualive' })}
        >
          Help & Support
        </button>
      </div>

      {isActive && (
        <div className="status-info">
          <div className="status-item">
            <span className="label">Status:</span>
            <span className="value active">Active</span>
          </div>
          <div className="status-item">
            <span className="label">Platform:</span>
            <span className="value">Auto-detected</span>
          </div>
        </div>
      )}
    </div>
  );
}

// History Panel Component
function HistoryPanel({ summaries, onRefresh }) {
  const [selectedSummary, setSelectedSummary] = useState(null);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportSummary = (summary) => {
    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-summary-${summary.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="history-panel">
      <div className="panel-header">
        <h3>Meeting History</h3>
        <button className="refresh-btn" onClick={onRefresh}>
          ↻ Refresh
        </button>
      </div>

      {summaries.length === 0 ? (
        <div className="empty-state">
          <p>No meeting summaries yet</p>
          <small>Start a translation session to generate meeting notes</small>
        </div>
      ) : (
        <div className="summaries-list">
          {summaries.slice(0, 10).map((summary) => (
            <div 
              key={summary.id}
              className="summary-item"
              onClick={() => setSelectedSummary(
                selectedSummary?.id === summary.id ? null : summary
              )}
            >
              <div className="summary-header">
                <div className="summary-title">
                  Meeting {formatDate(summary.createdAt)}
                </div>
                <div className="summary-actions">
                  <button 
                    className="export-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportSummary(summary);
                    }}
                  >
                    ↓
                  </button>
                </div>
              </div>
              
              {selectedSummary?.id === summary.id && (
                <div className="summary-details">
                  <div className="detail-item">
                    <strong>Duration:</strong> {summary.duration || 'Unknown'}
                  </div>
                  <div className="detail-item">
                    <strong>Languages:</strong> {summary.sourceLanguage} → {summary.targetLanguage}
                  </div>
                  <div className="detail-item">
                    <strong>Notes:</strong>
                    <div className="notes-preview">
                      {summary.notes || 'No notes available'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Panel Component
function SettingsPanel({ settings, onSettingsChange }) {
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(tempSettings);
  };

  const handleReset = () => {
    setTempSettings({
      sourceLanguage: 'en',
      targetLanguage: 'es',
      enableRealTimeNotes: true,
      enableProofreading: true,
      subtitlePosition: 'bottom',
      fontSize: 'medium',
      theme: 'dark',
      serverUrl: 'http://localhost:3001',
      authToken: ''
    });
  };

  return (
    <div className="settings-panel">
      <div className="panel-header">
        <h3>Settings</h3>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h4>Display</h4>
          
          <div className="setting-item">
            <label>Subtitle Position:</label>
            <select 
              value={tempSettings.subtitlePosition}
              onChange={(e) => setTempSettings({
                ...tempSettings,
                subtitlePosition: e.target.value
              })}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Font Size:</label>
            <select 
              value={tempSettings.fontSize}
              onChange={(e) => setTempSettings({
                ...tempSettings,
                fontSize: e.target.value
              })}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Theme:</label>
            <select 
              value={tempSettings.theme}
              onChange={(e) => setTempSettings({
                ...tempSettings,
                theme: e.target.value
              })}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h4>Server Connection</h4>
          
          <div className="setting-item">
            <label>Server URL:</label>
            <input 
              type="url"
              value={tempSettings.serverUrl}
              onChange={(e) => setTempSettings({
                ...tempSettings,
                serverUrl: e.target.value
              })}
              placeholder="http://localhost:3001"
            />
          </div>

          <div className="setting-item">
            <label>Auth Token:</label>
            <input 
              type="password"
              value={tempSettings.authToken}
              onChange={(e) => setTempSettings({
                ...tempSettings,
                authToken: e.target.value
              })}
              placeholder="Optional authentication token"
            />
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn secondary" onClick={handleReset}>
          Reset to Defaults
        </button>
        <button className="btn primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>

      <div className="settings-info">
        <h4>About</h4>
        <p>LinguaLive v1.0.0</p>
        <p>Privacy-first real-time translation with built-in Chrome AI</p>
        
        <div className="links">
          <a href="#" onClick={() => chrome.tabs.create({ url: 'https://github.com/yourusername/lingualive' })}>
            GitHub Repository
          </a>
          <a href="#" onClick={() => chrome.tabs.create({ url: 'https://github.com/yourusername/lingualive/issues' })}>
            Report Issues
          </a>
        </div>
      </div>
    </div>
  );
}

// Render the app
document.addEventListener('DOMContentLoaded', () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.remove();
  }
  
  const container = document.getElementById('app');
  const root = ReactDOM.createRoot(container);
  root.render(<LinguaLivePopup />);
});