import React, { useState, useEffect } from 'react';
import './App.css';

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
                const response = await fetch('http://localhost:3001/api/ai/translate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
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
  
  // Test API connection when app loads
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
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
  
  const handleStartMeeting = () => {
    if (apiStatus !== 'connected') {
      alert('⚠️ Backend server is not running!\n\nPlease start the backend server:\ncd server && npm run dev');
      return;
    }
    alert('Starting new meeting... 🎥\n\nThis will integrate with the meeting room component.');
    setCurrentView('meeting');
  };
  
  const handleJoinRoom = () => {
    if (apiStatus !== 'connected') {
      alert('⚠️ Backend server is not running!\n\nPlease start the backend server:\ncd server && npm run dev');
      return;
    }
    const roomId = prompt('Enter Room ID:');
    if (roomId) {
      alert(`Joining room: ${roomId} 🚪\n\nThis will connect to the real-time translation service.`);
      setCurrentView('meeting');
    }
  };

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
