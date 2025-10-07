import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the backend Socket.IO server
    const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to server:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    setSocket(newSocket);

    // Cleanup function
    return () => {
      newSocket.close();
    };
  }, []);

  return socket;
};