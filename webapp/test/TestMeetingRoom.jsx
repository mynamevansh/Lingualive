// Test file to verify MeetingRoom component integration
// This file can be used to test the component independently

import React from 'react';
import MeetingRoom from '../src/components/meeting/MeetingRoom';

// Mock meeting config for testing
const testMeetingConfig = {
  meeting: {
    meetingNumber: '12345678901',
    topic: 'Test Meeting',
    id: '12345678901',
    password: 'test123'
  },
  joinConfig: {
    meetingNumber: '12345678901',
    signature: 'mock-signature',
    sdkKey: 'mock-sdk-key',
    userName: 'Test User',
    userEmail: 'test@example.com',
    role: 0
  },
  isHost: false
};

// Test component mount
const TestMeetingRoom = () => {
  const handleLeaveMeeting = () => {
    console.log('Test: Leaving meeting');
  };

  return (
    <div>
      <h1>MeetingRoom Component Test</h1>
      <MeetingRoom 
        meetingConfig={testMeetingConfig}
        onLeaveMeeting={handleLeaveMeeting}
      />
    </div>
  );
};

export default TestMeetingRoom;