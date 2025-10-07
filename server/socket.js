const { v4: uuidv4 } = require('uuid');

// Store active rooms and users in memory (in production, use Redis)
const rooms = new Map();
const users = new Map();

const setupSocket = (io) => {
  console.log('Setting up Socket.IO handlers...');

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Store user info
    users.set(socket.id, {
      id: socket.id,
      joinedAt: new Date(),
      rooms: new Set(),
      isActive: true,
    });

    // Handle user joining a room
    socket.on('join-room', (data) => {
      const { roomId, userData = {} } = data;
      
      try {
        // Leave previous rooms
        Array.from(socket.rooms).forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join new room
        socket.join(roomId);
        
        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
            id: roomId,
            createdAt: new Date(),
            participants: new Map(),
            messages: [],
            subtitles: [],
            translations: [],
            isActive: true,
          });
        }

        const room = rooms.get(roomId);
        
        // Add user to room
        room.participants.set(socket.id, {
          id: socket.id,
          name: userData.name || `User ${socket.id.substring(0, 8)}`,
          joinedAt: new Date(),
          language: userData.language || 'en',
          isHost: room.participants.size === 0, // First user is host
          ...userData,
        });

        // Update user's room set
        const user = users.get(socket.id);
        if (user) {
          user.rooms.add(roomId);
        }

        // Notify room about new participant
        socket.to(roomId).emit('user-joined', {
          user: room.participants.get(socket.id),
          participantCount: room.participants.size,
          timestamp: new Date(),
        });

        // Send room info to joining user
        socket.emit('room-joined', {
          roomId,
          participants: Array.from(room.participants.values()),
          recentMessages: room.messages.slice(-20),
          recentSubtitles: room.subtitles.slice(-10),
          isHost: room.participants.get(socket.id).isHost,
        });

        console.log(`User ${socket.id} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle user leaving a room
    socket.on('leave-room', (data) => {
      const { roomId } = data;
      
      try {
        socket.leave(roomId);
        
        const room = rooms.get(roomId);
        if (room) {
          room.participants.delete(socket.id);
          
          // Notify room about user leaving
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
            participantCount: room.participants.size,
            timestamp: new Date(),
          });

          // Clean up empty room
          if (room.participants.size === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} cleaned up (empty)`);
          }
        }

        // Update user's room set
        const user = users.get(socket.id);
        if (user) {
          user.rooms.delete(roomId);
        }

        console.log(`User ${socket.id} left room ${roomId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Handle messages
    socket.on('message', (data) => {
      const { roomId, message, timestamp = Date.now() } = data;
      
      try {
        const room = rooms.get(roomId);
        if (!room || !room.participants.has(socket.id)) {
          socket.emit('error', { message: 'Not in room or room not found' });
          return;
        }

        const user = room.participants.get(socket.id);
        const messageData = {
          id: uuidv4(),
          userId: socket.id,
          userName: user.name,
          message,
          timestamp,
          type: 'message',
        };

        // Store message
        room.messages.push(messageData);
        
        // Limit message history
        if (room.messages.length > 100) {
          room.messages = room.messages.slice(-100);
        }

        // Broadcast to room
        io.to(roomId).emit('new-message', messageData);
        
        console.log(`Message in room ${roomId}: ${message}`);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle subtitles (real-time speech recognition results)
    socket.on('subtitle', (data) => {
      const { 
        roomId, 
        text, 
        language, 
        isFinal = false, 
        timestamp = Date.now(),
        confidence = 1.0 
      } = data;
      
      try {
        const room = rooms.get(roomId);
        if (!room || !room.participants.has(socket.id)) {
          return;
        }

        const user = room.participants.get(socket.id);
        const subtitleData = {
          id: uuidv4(),
          userId: socket.id,
          userName: user.name,
          text,
          language,
          isFinal,
          confidence,
          timestamp,
          type: 'subtitle',
        };

        // Store final subtitles only
        if (isFinal) {
          room.subtitles.push(subtitleData);
          
          // Limit subtitle history
          if (room.subtitles.length > 50) {
            room.subtitles = room.subtitles.slice(-50);
          }
        }

        // Broadcast to all users in room except sender
        socket.to(roomId).emit('subtitle-update', subtitleData);
        
        // Also send to sender for confirmation
        socket.emit('subtitle-received', { id: subtitleData.id, timestamp });
        
      } catch (error) {
        console.error('Error handling subtitle:', error);
      }
    });

    // Handle translations
    socket.on('translation', (data) => {
      const {
        roomId,
        originalText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        timestamp = Date.now(),
        confidence = 1.0
      } = data;
      
      try {
        const room = rooms.get(roomId);
        if (!room || !room.participants.has(socket.id)) {
          return;
        }

        const user = room.participants.get(socket.id);
        const translationData = {
          id: uuidv4(),
          userId: socket.id,
          userName: user.name,
          originalText,
          translatedText,
          sourceLanguage,
          targetLanguage,
          confidence,
          timestamp,
          type: 'translation',
        };

        // Store translation
        room.translations.push(translationData);
        
        // Limit translation history
        if (room.translations.length > 50) {
          room.translations = room.translations.slice(-50);
        }

        // Broadcast to room
        io.to(roomId).emit('translation-update', translationData);
        
      } catch (error) {
        console.error('Error handling translation:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { roomId, isTyping } = data;
      
      try {
        const room = rooms.get(roomId);
        if (!room || !room.participants.has(socket.id)) {
          return;
        }

        socket.to(roomId).emit('user-typing', {
          userId: socket.id,
          isTyping,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error handling typing:', error);
      }
    });

    // Handle meeting summary requests
    socket.on('request-summary', (data) => {
      const { roomId } = data;
      
      try {
        const room = rooms.get(roomId);
        if (!room || !room.participants.has(socket.id)) {
          socket.emit('error', { message: 'Not authorized or room not found' });
          return;
        }

        // Generate meeting summary
        const summary = generateMeetingSummary(room);
        
        // Send summary to requester
        socket.emit('meeting-summary', {
          roomId,
          summary,
          generatedAt: new Date(),
        });

        console.log(`Meeting summary generated for room ${roomId}`);
      } catch (error) {
        console.error('Error generating meeting summary:', error);
        socket.emit('error', { message: 'Failed to generate meeting summary' });
      }
    });

    // Handle room info requests
    socket.on('get-room-info', (data) => {
      const { roomId } = data;
      
      try {
        const room = rooms.get(roomId);
        if (!room) {
          socket.emit('room-info', { roomId, exists: false });
          return;
        }

        socket.emit('room-info', {
          roomId,
          exists: true,
          participantCount: room.participants.size,
          createdAt: room.createdAt,
          isActive: room.isActive,
        });
      } catch (error) {
        console.error('Error getting room info:', error);
      }
    });

    // Handle user status updates
    socket.on('update-status', (data) => {
      const { status, language } = data;
      
      try {
        const user = users.get(socket.id);
        if (user) {
          user.status = status;
          user.language = language;
          
          // Notify all rooms user is in
          user.rooms.forEach(roomId => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(socket.id)) {
              const participant = room.participants.get(socket.id);
              participant.status = status;
              participant.language = language;
              
              socket.to(roomId).emit('user-status-updated', {
                userId: socket.id,
                status,
                language,
                timestamp: Date.now(),
              });
            }
          });
        }
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.id} disconnected: ${reason}`);
      
      try {
        const user = users.get(socket.id);
        if (user) {
          // Leave all rooms
          user.rooms.forEach(roomId => {
            const room = rooms.get(roomId);
            if (room) {
              room.participants.delete(socket.id);
              
              // Notify room
              socket.to(roomId).emit('user-left', {
                userId: socket.id,
                participantCount: room.participants.size,
                timestamp: new Date(),
                reason: 'disconnected',
              });

              // Clean up empty rooms
              if (room.participants.size === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} cleaned up (empty after disconnect)`);
              }
            }
          });

          // Remove user
          users.delete(socket.id);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Room management endpoints
  io.engine.generateId = () => {
    return uuidv4();
  };

  // Periodic cleanup of inactive rooms
  setInterval(() => {
    const now = new Date();
    const inactiveThreshold = 24 * 60 * 60 * 1000; // 24 hours

    rooms.forEach((room, roomId) => {
      const timeSinceCreated = now - room.createdAt;
      const hasActiveParticipants = room.participants.size > 0;
      
      if (timeSinceCreated > inactiveThreshold && !hasActiveParticipants) {
        rooms.delete(roomId);
        console.log(`Cleaned up inactive room: ${roomId}`);
      }
    });
  }, 60 * 60 * 1000); // Run every hour

  console.log('Socket.IO handlers configured');
};

// Helper function to generate meeting summary
function generateMeetingSummary(room) {
  const participants = Array.from(room.participants.values());
  const messageCount = room.messages.length;
  const subtitleCount = room.subtitles.length;
  const translationCount = room.translations.length;
  
  // Extract key messages
  const keyMessages = room.messages
    .filter(msg => msg.message.length > 20) // Filter out short messages
    .slice(-10); // Last 10 meaningful messages

  // Extract recent subtitles
  const recentSubtitles = room.subtitles
    .filter(sub => sub.isFinal)
    .slice(-5);

  // Calculate duration
  const duration = new Date() - room.createdAt;
  const durationMinutes = Math.round(duration / (1000 * 60));

  return {
    roomId: room.id,
    startTime: room.createdAt,
    endTime: new Date(),
    duration: `${durationMinutes} minutes`,
    participants: participants.map(p => ({
      name: p.name,
      language: p.language,
      isHost: p.isHost,
      joinedAt: p.joinedAt,
    })),
    stats: {
      messageCount,
      subtitleCount,
      translationCount,
      participantCount: participants.length,
    },
    keyMessages: keyMessages.map(msg => ({
      user: msg.userName,
      message: msg.message,
      timestamp: msg.timestamp,
    })),
    recentSubtitles: recentSubtitles.map(sub => ({
      user: sub.userName,
      text: sub.text,
      language: sub.language,
      timestamp: sub.timestamp,
    })),
    languages: [...new Set(participants.map(p => p.language))],
  };
}

// Export functions for external use
module.exports = setupSocket;