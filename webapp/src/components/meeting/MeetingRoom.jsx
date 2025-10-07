import React, { useState, useEffect, useRef } from 'react';
import simpleZoomService from '../../services/simpleZoomService';
import '../../styles/zoom-sdk.css';

const MeetingRoom = ({ onLeaveMeeting, meetingConfig }) => {
  const [meetingStatus, setMeetingStatus] = useState('initializing');
  const [error, setError] = useState(null);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [translations, setTranslations] = useState([]);
  const meetingContainerRef = useRef(null);

  useEffect(() => {
    initializeMeeting();
    
    return () => {
      // Cleanup on unmount
      handleLeaveMeeting();
    };
  }, []);

  const initializeMeeting = async () => {
    try {
      setMeetingStatus('connecting');
      setError(null);
      
      console.log('🔄 Initializing meeting with config:', meetingConfig);
      
      // Initialize Zoom SDK with configuration
      const initConfig = meetingConfig.joinConfig || {};
      const initialized = await simpleZoomService.initialize(initConfig);
      
      if (!initialized) {
        console.log('🔧 SDK initialization failed, using development mode');
      }
      
      // Determine meeting mode
      let meeting = meetingConfig;
      
      if (!meetingConfig.meeting && !meetingConfig.meetingNumber) {
        console.log('📞 Creating new meeting...');
        // Create new meeting via service
        meeting = await simpleZoomService.createMeeting({
          topic: meetingConfig.topic || 'LinguaLive Meeting',
          duration: meetingConfig.duration || 60,
        });
      } else {
        console.log('📞 Joining existing meeting...');
        meeting = meetingConfig;
      }

      // Join the meeting with container reference
      if (meetingContainerRef.current) {
        console.log('📺 Setting up meeting container...');
        await simpleZoomService.joinMeeting(meeting, meetingContainerRef.current);
      } else {
        console.warn('⚠️ Meeting container not ready, retrying...');
        // Retry after a short delay
        setTimeout(async () => {
          if (meetingContainerRef.current) {
            await simpleZoomService.joinMeeting(meeting, meetingContainerRef.current);
          }
        }, 500);
      }
      
      setMeetingStatus('connected');
      console.log('✅ Meeting initialization completed');
      
      // Set up event listeners for real-time updates
      setupMeetingEventListeners();
      
    } catch (err) {
      console.error('❌ Failed to initialize meeting:', err);
      setError(`Meeting initialization failed: ${err.message}`);
      setMeetingStatus('error');
    }
  };

  const setupMeetingEventListeners = () => {
    // Listen for translation updates
    window.addEventListener('translation-update', handleTranslationUpdate);
    
    // Listen for participant changes
    window.addEventListener('participant-update', handleParticipantUpdate);
  };

  const handleTranslationUpdate = (event) => {
    const translation = event.detail;
    setTranslations(prev => [
      ...prev.slice(-9), // Keep last 10 translations
      {
        id: Date.now(),
        timestamp: new Date(),
        speaker: translation.speaker,
        original: translation.transcript,
        translated: translation.translation,
        language: translation.targetLanguage
      }
    ]);
  };

  const handleParticipantUpdate = (event) => {
    setParticipants(event.detail.participants || []);
  };

  const handleToggleTranslation = () => {
    if (translationEnabled) {
      simpleZoomService.disableTranslation();
      setTranslationEnabled(false);
    } else {
      simpleZoomService.enableTranslation();
      setTranslationEnabled(true);
      
      // In development mode, simulate some translation updates
      if (meetingConfig?.joinConfig?.sdkKey === 'development-sdk-key' || 
          meetingConfig?.joinConfig?.sdkKey === 'mock-sdk-key' || 
          meetingConfig?.meeting?.isMock) {
        simulateTranslationUpdates();
      }
    }
  };

  const simulateTranslationUpdates = () => {
    const mockTranslations = [
      {
        speaker: 'Host',
        original: 'Welcome everyone to our international meeting!',
        translated: 'ยินดีต้อนรับทุกคนสู่การประชุมระหว่างประเทศของเรา!',
        targetLanguage: 'Thai'
      },
      {
        speaker: 'Participant 1', 
        original: 'Thank you for having me here today.',
        translated: 'Gracias por tenerme aquí hoy.',
        targetLanguage: 'Spanish'
      },
      {
        speaker: 'Host',
        original: 'Let\'s discuss our quarterly results.',
        translated: 'Lassen Sie uns unsere Quartalsergebnisse besprechen.',
        targetLanguage: 'German'
      }
    ];

    mockTranslations.forEach((translation, index) => {
      setTimeout(() => {
        setTranslations(prev => [
          ...prev.slice(-9),
          {
            id: Date.now() + index,
            timestamp: new Date(),
            speaker: translation.speaker,
            original: translation.original,
            translated: translation.translated,
            language: translation.targetLanguage
          }
        ]);
      }, (index + 1) * 3000);
    });
  };

  const handleLeaveMeeting = async () => {
    try {
      await simpleZoomService.leaveMeeting();
      if (onLeaveMeeting) {
        onLeaveMeeting();
      }
    } catch (err) {
      console.error('Error leaving meeting:', err);
    }
  };

  const renderMeetingStatus = () => {
    switch (meetingStatus) {
      case 'initializing':
        return (
          <div className="meeting-status">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Initializing meeting...</p>
          </div>
        );
      
      case 'connecting':
        return (
          <div className="meeting-status">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-indigo-200 h-8 w-8"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
                <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600 mb-2">Connecting to meeting...</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>🔄 Loading Zoom SDK...</div>
                <div>📡 Establishing connection...</div>
                <div>🔧 Initializing translation features...</div>
              </div>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="meeting-error max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 w-full">
                  <h3 className="text-sm font-medium text-red-800">Meeting Initialization Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p className="mb-2">{error}</p>
                    
                    {/* Development mode notice */}
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Development Mode:</strong> This app is running in development mode. 
                        For real Zoom meetings, proper Zoom SDK credentials are required.
                      </p>
                    </div>
                    
                    {/* Debug information */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                        Show Debug Information
                      </summary>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        <p>Meeting Config: {JSON.stringify(meetingConfig, null, 2)}</p>
                      </div>
                    </details>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={initializeMeeting}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      Retry Connection
                    </button>
                    <button
                      onClick={onLeaveMeeting}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (meetingStatus !== 'connected') {
    return (
      <div className="meeting-room-container flex items-center justify-center min-h-screen bg-gray-50">
        {renderMeetingStatus()}
      </div>
    );
  }

  return (
    <div className="meeting-room-container h-screen bg-gray-900 relative">
      {/* Zoom Meeting Container */}
      <div 
        ref={meetingContainerRef}
        className="zoom-meeting-container w-full h-full"
        id="zoom-meeting-container"
      >
        {/* Development Mode Display */}
        {(meetingConfig?.joinConfig?.sdkKey === 'development-sdk-key' || 
          meetingConfig?.joinConfig?.sdkKey === 'mock-sdk-key' || 
          meetingConfig?.meeting?.isMock) && (
          <div className="development-mode-overlay">
            <h2>🔧 Development Mode</h2>
            <div className="mock-video">
              <div className="text-center">
                <p className="text-sm opacity-80 mb-2">Mock Video Stream</p>
                <div className="status-indicator connected"></div>
                <span className="text-xs">Meeting Active</span>
              </div>
            </div>
            <p>
              This is a simulated Zoom meeting environment for development.
              <br />
              Real meetings require proper Zoom SDK credentials.
            </p>
            <div className="text-sm opacity-75 mt-2">
              Meeting ID: {meetingConfig?.meeting?.meetingNumber || meetingConfig?.meeting?.id || 'Mock Meeting'}
            </div>
          </div>
        )}
      </div>

      {/* Translation Panel */}
      <div className="translation-panel absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden">
        <div className="panel-header bg-indigo-600 text-white p-3 flex justify-between items-center">
          <h3 className="font-medium">Live Translation</h3>
          <button
            onClick={handleToggleTranslation}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              translationEnabled 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {translationEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <div className="panel-content max-h-64 overflow-y-auto p-3 space-y-2">
          {translations.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p className="text-sm">
                {translationEnabled 
                  ? 'Listening for speech...' 
                  : 'Enable translation to see live translations'
                }
              </p>
            </div>
          ) : (
            translations.map((translation) => (
              <div key={translation.id} className="translation-item bg-gray-50 rounded p-2">
                <div className="speaker-info text-xs text-gray-500 mb-1">
                  {translation.speaker} • {translation.timestamp.toLocaleTimeString()}
                </div>
                <div className="original-text text-sm text-gray-800 mb-1">
                  {translation.original}
                </div>
                {translation.translated && (
                  <div className="translated-text text-sm text-indigo-600 font-medium">
                    🌐 {translation.translated}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Meeting Controls */}
      <div className="meeting-controls absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-6 py-3 flex items-center space-x-4">
        <button
          onClick={handleToggleTranslation}
          className={`p-2 rounded-full transition-colors ${
            translationEnabled
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          title="Toggle Translation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </button>

        <div className="h-6 w-px bg-gray-300"></div>

        <button
          onClick={handleLeaveMeeting}
          className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Leave</span>
        </button>
      </div>

      {/* Participants Count and Status */}
      <div className="participants-info absolute top-4 left-4 space-y-2">
        <div className="bg-white rounded-lg shadow px-3 py-2">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {/* Development Mode Indicator */}
        {meetingConfig?.joinConfig?.sdkKey === 'development-sdk-key' || 
         meetingConfig?.joinConfig?.sdkKey === 'mock-sdk-key' || 
         meetingConfig?.meeting?.isMock ? (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5C3.312 16.333 4.252 18 5.792 18z" />
              </svg>
              <span className="text-xs font-medium text-yellow-800">
                Development Mode
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MeetingRoom;