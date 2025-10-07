const express = require('express');
const router = express.Router();
const zoomMeetingService = require('../services/zoomMeetingService');

// Create a new meeting
router.post('/create', async (req, res) => {
  try {
    const { topic, duration, settings, userInfo } = req.body;
    
    const meetingConfig = {
      topic: topic || 'LinguaLive Meeting',
      duration: duration || 60,
      settings: {
        join_before_host: settings?.join_before_host || false,
        mute_upon_entry: settings?.mute_upon_entry || true,
        audio: settings?.audio || 'voip',
        auto_recording: settings?.auto_recording || 'none',
        waiting_room: settings?.waiting_room || false,
        ...settings
      }
    };

    console.log('🔄 Creating Zoom meeting with config:', meetingConfig);
    
    const meeting = await zoomMeetingService.createMeeting(meetingConfig);
    
    // Generate join configuration for the creator (host)
    const joinConfig = zoomMeetingService.generateJoinConfig(meeting, {
      ...userInfo,
      isHost: true
    });

    res.json({
      success: true,
      meeting: {
        id: meeting.id,
        meetingNumber: meeting.meetingNumber,
        topic: meeting.topic,
        join_url: meeting.join_url,
        start_url: meeting.start_url,
        password: meeting.password,
        created_at: meeting.created_at,
        duration: meeting.duration,
        isMock: meeting.isMock || false
      },
      joinConfig,
      message: meeting.isMock ? 
        'Meeting created in development mode' : 
        'Meeting created successfully'
    });

    console.log('✅ Meeting created successfully:', meeting.id);
  } catch (error) {
    console.error('❌ Error creating meeting:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create meeting',
      details: error.message
    });
  }
});

// Generate signature for joining existing meeting
router.post('/join-signature', async (req, res) => {
  try {
    const { meetingNumber, role, userInfo } = req.body;
    
    console.log('🔄 Generating join signature for meeting:', meetingNumber);
    
    // Validate required fields
    if (!meetingNumber) {
      return res.status(400).json({
        success: false,
        error: 'Meeting number is required'
      });
    }

    // Validate meeting number format (basic check)
    if (!/^\d{9,11}$/.test(meetingNumber.toString())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid meeting number format. Must be 9-11 digits.'
      });
    }

    const userRole = parseInt(role) || 0;
    const signature = zoomMeetingService.generateSDKSignature(meetingNumber, userRole);
    
    const joinConfig = {
      meetingNumber: meetingNumber.toString(),
      signature: signature,
      sdkKey: process.env.ZOOM_SDK_KEY || 'mock-sdk-key',
      userName: userInfo?.name || 'LinguaLive User',
      userEmail: userInfo?.email || '',
      role: userRole,
      lang: 'en-US',
      china: false,
      webEndpoint: 'zoom.us',
      success: function() {
        console.log('Meeting joined successfully');
      },
      error: function(error) {
        console.error('Meeting join error:', error);
      }
    };

    // Check if using mock credentials
    const isMockMode = !process.env.ZOOM_SDK_KEY || !process.env.ZOOM_SDK_SECRET;

    res.json({
      success: true,
      joinConfig,
      isMockMode,
      message: isMockMode ? 
        'Join signature generated in development mode' : 
        'Join signature generated successfully'
    });

    console.log(`✅ Join signature generated for meeting: ${meetingNumber} (${isMockMode ? 'Mock Mode' : 'Production Mode'})`);
  } catch (error) {
    console.error('❌ Error generating join signature:', {
      message: error.message,
      stack: error.stack,
      meetingNumber: req.body?.meetingNumber
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate join signature',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get meeting details
router.get('/:meetingId', async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const meeting = await zoomMeetingService.getMeetingDetails(meetingId);
    
    res.json({
      success: true,
      meeting,
      message: 'Meeting details retrieved successfully'
    });

    console.log('✅ Meeting details retrieved:', meetingId);
  } catch (error) {
    console.error('❌ Error getting meeting details:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get meeting details',
      details: error.message
    });
  }
});

// End a meeting
router.post('/:meetingId/end', async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const result = await zoomMeetingService.endMeeting(meetingId);
    
    res.json({
      success: true,
      message: result.message
    });

    console.log('✅ Meeting ended:', meetingId);
  } catch (error) {
    console.error('❌ Error ending meeting:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to end meeting',
      details: error.message
    });
  }
});

// List user meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await zoomMeetingService.listMeetings();
    
    res.json({
      success: true,
      meetings: meetings.meetings || [],
      pagination: {
        page_count: meetings.page_count || 0,
        page_number: meetings.page_number || 1,
        page_size: meetings.page_size || 30,
        total_records: meetings.total_records || 0
      },
      message: 'Meetings retrieved successfully'
    });

    console.log('✅ Meetings list retrieved');
  } catch (error) {
    console.error('❌ Error listing meetings:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to list meetings',
      details: error.message
    });
  }
});

// Validate meeting access
router.post('/validate', async (req, res) => {
  try {
    const { meetingNumber, password } = req.body;
    
    const isValid = zoomMeetingService.validateMeetingAccess(meetingNumber, password);
    
    res.json({
      success: true,
      valid: isValid,
      message: isValid ? 'Meeting access validated' : 'Invalid meeting credentials'
    });

    console.log('✅ Meeting validation completed:', meetingNumber);
  } catch (error) {
    console.error('❌ Error validating meeting:', error.message);
    res.status(400).json({
      success: false,
      valid: false,
      error: error.message
    });
  }
});

module.exports = router;