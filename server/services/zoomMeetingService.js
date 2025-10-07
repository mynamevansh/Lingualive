const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');

class ZoomMeetingService {
  constructor() {
    // Zoom API credentials (set these in environment variables)
    this.apiKey = process.env.ZOOM_API_KEY;
    this.apiSecret = process.env.ZOOM_API_SECRET;
    this.sdkKey = process.env.ZOOM_SDK_KEY;
    this.sdkSecret = process.env.ZOOM_SDK_SECRET;
    this.baseURL = 'https://api.zoom.us/v2';
    
    if (!this.apiKey || !this.apiSecret) {
      console.warn('⚠️ Zoom API credentials not configured. Meeting creation will use mock data.');
    }
  }

  // Generate JWT token for Zoom API
  generateJWT() {
    const payload = {
      iss: this.apiKey,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    };
    
    return jwt.sign(payload, this.apiSecret);
  }

  // Generate SDK signature for meeting join
  generateSDKSignature(meetingNumber, role = 0) {
    // If SDK credentials are not configured, return mock signature
    if (!this.sdkKey || !this.sdkSecret) {
      console.warn('⚠️ Zoom SDK credentials not configured. Using mock signature.');
      return this.generateMockSignature(meetingNumber, role);
    }

    try {
      const timestamp = Date.now();
      const msg = Buffer.from(this.sdkKey + meetingNumber + timestamp + role).toString('base64');
      const hash = crypto.createHmac('sha256', this.sdkSecret).update(msg).digest('base64');
      
      return Buffer.from(`${this.sdkKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64');
    } catch (error) {
      console.error('❌ Failed to generate SDK signature:', error.message);
      console.warn('🔧 Falling back to mock signature');
      return this.generateMockSignature(meetingNumber, role);
    }
  }

  // Create a new Zoom meeting
  async createMeeting(meetingConfig) {
    try {
      // If no API credentials, return mock meeting data for development
      if (!this.apiKey) {
        return this.createMockMeeting(meetingConfig);
      }

      const token = this.generateJWT();
      
      const meetingData = {
        topic: meetingConfig.topic || 'LinguaLive Meeting',
        type: 1, // Instant meeting
        duration: meetingConfig.duration || 60,
        timezone: 'UTC',
        settings: {
          join_before_host: meetingConfig.settings?.join_before_host || false,
          mute_upon_entry: meetingConfig.settings?.mute_upon_entry || true,
          use_pmi: false,
          approval_type: 0,
          audio: meetingConfig.settings?.audio || 'voip',
          auto_recording: meetingConfig.settings?.auto_recording || 'none',
          waiting_room: meetingConfig.settings?.waiting_room || false,
          // Enable features for better integration
          allow_multiple_devices: true,
          participant_video: true,
          host_video: true,
          cn_meeting: false,
          in_meeting: false,
          breakout_room: {
            enable: false
          }
        }
      };

      const response = await axios.post(`${this.baseURL}/users/me/meetings`, meetingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const meeting = response.data;
      
      // Generate signature for SDK
      const signature = this.generateSDKSignature(meeting.id);
      
      return {
        id: meeting.id,
        meetingNumber: meeting.id,
        topic: meeting.topic,
        join_url: meeting.join_url,
        start_url: meeting.start_url,
        password: meeting.password,
        signature: signature,
        sdkKey: this.sdkKey,
        created_at: meeting.created_at,
        duration: meeting.duration,
        settings: meeting.settings
      };
    } catch (error) {
      console.error('❌ Failed to create Zoom meeting:', error.response?.data || error.message);
      
      // Fallback to mock meeting if API fails
      if (error.response?.status === 401) {
        console.warn('⚠️ Zoom API authentication failed. Check your credentials.');
      }
      
      return this.createMockMeeting(meetingConfig);
    }
  }

  // Create mock meeting for development/testing
  createMockMeeting(meetingConfig) {
    const meetingId = Math.floor(Math.random() * 1000000000);
    const password = Math.random().toString(36).substring(2, 8);
    
    console.log('🔧 Creating mock Zoom meeting for development...');
    
    return {
      id: meetingId,
      meetingNumber: meetingId,
      topic: meetingConfig.topic || 'LinguaLive Meeting (Mock)',
      join_url: `https://zoom.us/j/${meetingId}?pwd=${password}`,
      start_url: `https://zoom.us/s/${meetingId}?pwd=${password}`,
      password: password,
      signature: this.generateMockSignature(meetingId),
      sdkKey: this.sdkKey || 'mock-sdk-key',
      created_at: new Date().toISOString(),
      duration: meetingConfig.duration || 60,
      settings: meetingConfig.settings || {},
      isMock: true
    };
  }

  // Generate mock signature for development
  generateMockSignature(meetingNumber, role = 0) {
    const timestamp = Date.now();
    const mockSdkKey = this.sdkKey || 'mock-sdk-key';
    const mockSignature = Buffer.from(`${mockSdkKey}.${meetingNumber}.${timestamp}.${role}.mock-hash`).toString('base64');
    console.log(`🔧 Generated mock signature for meeting ${meetingNumber} with role ${role}`);
    return mockSignature;
  }

  // Get meeting details
  async getMeetingDetails(meetingId) {
    try {
      if (!this.apiKey) {
        return {
          id: meetingId,
          topic: 'Mock Meeting',
          status: 'active',
          participants: []
        };
      }

      const token = this.generateJWT();
      
      const response = await axios.get(`${this.baseURL}/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Failed to get meeting details:', error.response?.data || error.message);
      throw new Error('Failed to retrieve meeting details');
    }
  }

  // End a meeting
  async endMeeting(meetingId) {
    try {
      if (!this.apiKey) {
        console.log('🔧 Mock meeting ended:', meetingId);
        return { success: true, message: 'Mock meeting ended' };
      }

      const token = this.generateJWT();
      
      await axios.patch(`${this.baseURL}/meetings/${meetingId}/status`, {
        action: 'end'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true, message: 'Meeting ended successfully' };
    } catch (error) {
      console.error('❌ Failed to end meeting:', error.response?.data || error.message);
      throw new Error('Failed to end meeting');
    }
  }

  // List user meetings
  async listMeetings(userId = 'me') {
    try {
      if (!this.apiKey) {
        return {
          meetings: [],
          page_count: 0,
          page_number: 1,
          page_size: 30,
          total_records: 0
        };
      }

      const token = this.generateJWT();
      
      const response = await axios.get(`${this.baseURL}/users/${userId}/meetings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Failed to list meetings:', error.response?.data || error.message);
      throw new Error('Failed to list meetings');
    }
  }

  // Validate meeting credentials
  validateMeetingAccess(meetingNumber, password) {
    // Basic validation - in production, this should verify against Zoom API
    if (!meetingNumber || meetingNumber.length < 9) {
      throw new Error('Invalid meeting number');
    }
    
    return true;
  }

  // Generate meeting join configuration
  generateJoinConfig(meetingData, userInfo = {}) {
    return {
      meetingNumber: meetingData.meetingNumber || meetingData.id,
      password: meetingData.password,
      signature: meetingData.signature,
      sdkKey: this.sdkKey,
      userName: userInfo.name || 'LinguaLive User',
      userEmail: userInfo.email || '',
      role: userInfo.isHost ? 1 : 0,
      lang: 'en-US',
      china: false,
      webEndpoint: 'zoom.us'
    };
  }
}

module.exports = new ZoomMeetingService();