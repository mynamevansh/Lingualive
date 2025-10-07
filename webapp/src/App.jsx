import React, { useState, useEffect } from 'react';
import './App.css';
import MeetingRoom from './components/meeting/MeetingRoom';
import { apiRequest, API_ENDPOINTS, buildApiUrl } from './config/api.js';

// Simple components for the clean UI
const Header = ({ apiStatus }) => (
  <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">LinguaLive</h1>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            apiStatus === 'connected' ? 'bg-green-500 text-white' : 
            apiStatus === 'checking' ? 'bg-yellow-500 text-white' : 
            'bg-red-500 text-white'
          }`}>
            {apiStatus === 'connected' ? '🟢 Backend Connected' : 
             apiStatus === 'checking' ? '🟡 Checking Backend...' : 
             '🔴 Backend Offline'}
          </div>
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-indigo-200 transition-colors">Home</a>
          <a href="#" className="hover:text-indigo-200 transition-colors">Features</a>
          <a href="#" className="hover:text-indigo-200 transition-colors">About</a>
          <a href="#" className="hover:text-indigo-200 transition-colors">Contact</a>
        </nav>
      </div>
    </div>
  </header>
);

const WelcomeSection = ({ onStartMeeting, onJoinRoom }) => (
  <main className="flex-1 bg-gradient-to-br from-gray-50 to-white">
    <div className="container mx-auto px-6 py-16">
      <div className="text-center">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
          Speak Freely. <span className="text-indigo-600">Understand Instantly.</span>
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Break down language barriers with AI-powered real-time translation, 
          live subtitles, and intelligent meeting summaries.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={onStartMeeting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg 
                     shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Start Meeting
          </button>
          
          <button
            onClick={onJoinRoom}
            className="bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-4 px-8 rounded-lg 
                     border-2 border-indigo-600 shadow-lg transform hover:scale-105 transition-all duration-200 
                     flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Join Room
          </button>
          
          <button
            onClick={async () => {
              try {
                const response = await apiRequest(API_ENDPOINTS.TRANSLATE, {
                  method: 'POST',
                  body: JSON.stringify({ text: 'Hello', sourceLanguage: 'en', targetLanguage: 'es' })
                });
                const result = await response.json();
                alert(`✅ API Test Successful!\n\nTranslation: "${result.originalText}" → "${result.translatedText}"\nBackend Status: ${response.ok ? 'Connected' : 'Error'}`);
              } catch (error) {
                alert(`❌ API Test Failed!\n\nError: ${error.message}\n\nMake sure backend is running:\ncd server && npm run dev`);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg 
                     shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Test API Connection
          </button>
          
          <button
            onClick={async () => {
              try {
                console.log('🧪 Testing Zoom SDK ReactDOM fix...');
                
                // Import our Zoom service
                const { default: simpleZoomService } = await import('./services/simpleZoomService');
                
                // Test SDK loading
                const initialized = await simpleZoomService.initialize();
                
                if (initialized) {
                  alert('🎉 Success! Zoom SDK loaded without ReactDOM errors.\n\nCheck the browser console for detailed logs.');
                  console.log('✅ Zoom SDK test completed successfully');
                } else {
                  alert('⚠️ SDK initialization failed but no ReactDOM errors occurred.\n\nThis is expected in development mode. Check console for details.');
                  console.log('⚠️ SDK in development mode - this is normal');
                }
              } catch (error) {
                console.error('❌ Zoom SDK test failed:', error);
                alert(`❌ Zoom SDK Test Failed:\n\n${error.message}\n\nCheck browser console for detailed error logs.`);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg 
                     shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Test Zoom SDK
          </button>
          
          <button
            onClick={async () => {
              try {
                console.log('🔄 Testing CORS Solutions...');
                
                // Import CORS test utilities
                const { testBothMethods, checkBackendHealth, checkProxyHealth } = await import('./utils/corsTest');
                
                // Run comprehensive CORS tests
                console.log('=== CORS Solution Tests ===');
                await checkBackendHealth();
                await checkProxyHealth();
                await testBothMethods();
                
                alert('🎉 CORS tests completed!\n\nCheck the browser console for detailed results.\n\nBoth server-side CORS and Vite proxy solutions have been tested.');
              } catch (error) {
                console.error('❌ CORS test failed:', error);
                alert(`❌ CORS Test Failed:\n\n${error.message}\n\nCheck browser console for details.`);
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg 
                     shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            Test CORS Solutions
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Translation</h3>
            <p className="text-gray-600">Instant translation in 100+ languages with sub-second latency</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Summaries</h3>
            <p className="text-gray-600">Intelligent meeting notes with key points and action items</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
            <p className="text-gray-600">Your conversations stay secure with end-to-end encryption</p>
          </div>
        </div>
      </div>
    </div>
  </main>
);

const Footer = () => (
  <footer className="bg-gray-800 text-white">
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold">LinguaLive</h3>
          <p className="text-gray-400">Breaking language barriers worldwide</p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
        <p>&copy; 2025 LinguaLive. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [apiStatus, setApiStatus] = useState('checking');
  const [meetingConfig, setMeetingConfig] = useState(null);
  
  // Test API connection when app loads
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await apiRequest(API_ENDPOINTS.HEALTH);
        if (response.ok) {
          const data = await response.json();
          setApiStatus('connected');
          console.log('✅ Backend connected:', data);
        } else {
          setApiStatus('error');
          console.error('❌ Backend responded with error:', response.status);
        }
      } catch (error) {
        setApiStatus('error');
        console.error('❌ Backend connection failed:', error);
      }
    };
    
    testAPI();
  }, []);
  
  const handleStartMeeting = async () => {
    if (apiStatus !== 'connected') {
      alert('⚠️ Backend server is not running!\n\nPlease start the backend server:\ncd server && npm run dev');
      return;
    }

    try {
      console.log('🔄 Creating new Zoom meeting...');
      
      // Create meeting via backend API
      const response = await apiRequest(API_ENDPOINTS.MEETINGS_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'LinguaLive Meeting',
          duration: 60,
          settings: {
            mute_upon_entry: true,
            waiting_room: false,
            join_before_host: true
          },
          userInfo: {
            name: 'Host User',
            email: 'host@lingualive.com'
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Meeting created successfully:', result.meeting);
        setMeetingConfig({
          meeting: result.meeting,
          joinConfig: result.joinConfig,
          isHost: true
        });
        setCurrentView('meeting');
      } else {
        throw new Error(result.error || 'Failed to create meeting');
      }
    } catch (error) {
      console.error('❌ Failed to create meeting:', error);
      alert(`❌ Failed to create meeting:\n${error.message}\n\nPlease check the console for more details.`);
    }
  };
  
  const handleJoinRoom = async () => {
    if (apiStatus !== 'connected') {
      alert('⚠️ Backend server is not running!\n\nPlease start the backend server:\ncd server && npm run dev');
      return;
    }
    
    const meetingNumber = prompt('Enter Meeting ID:');
    if (meetingNumber) {
      try {
        console.log('🔄 Generating join signature for meeting:', meetingNumber);
        
        const response = await apiRequest(API_ENDPOINTS.MEETINGS_JOIN_SIGNATURE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meetingNumber: meetingNumber,
            role: 0, // participant role
            userInfo: {
              name: 'Participant User',
              email: 'participant@lingualive.com'
            }
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Join signature generated successfully');
          setMeetingConfig({
            meeting: { 
              meetingNumber: meetingNumber,
              topic: 'Joined Meeting',
              id: meetingNumber
            },
            joinConfig: result.joinConfig,
            isHost: false
          });
          setCurrentView('meeting');
        } else {
          throw new Error(result.error || 'Failed to generate join signature');
        }
      } catch (error) {
        console.error('❌ Failed to join meeting:', error);
        alert(`❌ Failed to join meeting:\n${error.message}`);
      }
    }
  };

  const handleLeaveMeeting = () => {
    setCurrentView('home');
    setMeetingConfig(null);
    console.log('📴 Left meeting, returning to home');
  };

  if (currentView === 'meeting' && meetingConfig) {
    return (
      <div className="min-h-screen bg-gray-900">
        <MeetingRoom 
          meetingConfig={meetingConfig}
          onLeaveMeeting={handleLeaveMeeting}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header apiStatus={apiStatus} />
      <WelcomeSection 
        onStartMeeting={handleStartMeeting}
        onJoinRoom={handleJoinRoom}
      />
      <Footer />
    </div>
  );
}

export default App;
