const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import configurations and routes
const connectDB = require('./config/db');
const setupSocket = require('./socket');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const meetingRoutes = require('./routes/meetings');
const aiRoutes = require('./routes/ai');
const zoomProxyRoutes = require('./routes/zoom-proxy');

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware setup
// Enhanced CORS configuration for React frontend + Zoom SDK compatibility
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',        // Vite dev server
      'http://localhost:5174',        // Alternative Vite port
      'http://localhost:3000',        // Create React App default
      'http://127.0.0.1:5173',        // Alternative localhost
      'http://127.0.0.1:5174',
      process.env.CLIENT_URL,         // Production frontend URL
      process.env.FRONTEND_URL        // Additional environment variable
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked origin: ${origin}`);
      callback(null, false); // Allow anyway for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Content-Type', 'Content-Length', 'X-Total-Count'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Add Zoom SDK required headers to ALL responses
app.use((req, res, next) => {
  // Headers required for Zoom SDK Cross-Origin security
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Additional headers for script loading
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// Relaxed helmet config for Zoom SDK compatibility
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "http://localhost:3001", "https://source.zoom.us"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:3001", "https://source.zoom.us"],
      frameSrc: ["'self'", "https://zoom.us"],
      mediaSrc: ["'self'", "https:"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
    },
  },
  crossOriginOpenerPolicy: false, // Disable to allow Zoom SDK
  crossOriginEmbedderPolicy: false // Let our custom middleware handle this
}));

app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/zoom', zoomProxyRoutes);

// CORS Test Endpoint
app.get('/api/data', (req, res) => {
  console.log(`🔄 CORS test request from origin: ${req.headers.origin}`);
  
  res.json({
    message: "Hello from the server!",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    method: req.method,
    cors: "This response should work with both server-side CORS and Vite proxy"
  });
});

// Additional CORS test endpoints
app.post('/api/data', (req, res) => {
  console.log(`🔄 CORS POST test request from origin: ${req.headers.origin}`);
  
  res.json({
    message: "POST request successful!",
    receivedData: req.body,
    timestamp: new Date().toISOString(),
    cors: "POST requests working with CORS"
  });
});

app.get('/api/cors-test', (req, res) => {
  res.json({
    cors: {
      origin: req.headers.origin,
      method: req.method,
      headers: req.headers,
      timestamp: new Date().toISOString(),
      serverMessage: "CORS configuration is working correctly!"
    }
  });
});

// AI Services endpoints
app.post('/api/ai/translate', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;
    
    // Mock translation for demo - in production, integrate with actual AI service
    const mockTranslations = {
      'en-es': {
        'hello': 'hola',
        'goodbye': 'adiós',
        'thank you': 'gracias',
        'please': 'por favor'
      },
      'es-en': {
        'hola': 'hello',
        'adiós': 'goodbye',
        'gracias': 'thank you',
        'por favor': 'please'
      }
    };

    const translationKey = `${sourceLanguage}-${targetLanguage}`;
    const translations = mockTranslations[translationKey] || {};
    const translatedText = translations[text.toLowerCase()] || `[Translated: ${text}]`;

    res.json({
      success: true,
      originalText: text,
      translatedText,
      sourceLanguage,
      targetLanguage,
      confidence: 0.95,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation service unavailable',
      message: error.message
    });
  }
});

app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    // Mock summarization for demo
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, Math.min(3, Math.ceil(sentences.length / 3)))
      .map(s => s.trim())
      .join('. ') + '.';

    res.json({
      success: true,
      originalText: text,
      summary: summary || 'No content to summarize.',
      type: options.type || 'key-points',
      wordCount: summary.split(' ').length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({
      success: false,
      error: 'Summarization service unavailable',
      message: error.message
    });
  }
});

app.post('/api/ai/proofread', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    // Mock proofreading for demo
    let correctedText = text
      .replace(/\bi\s/gi, 'I ')  // Capitalize "i"
      .replace(/\s+/g, ' ')      // Remove extra spaces
      .replace(/\s+([,.!?;:])/g, '$1')  // Remove spaces before punctuation
      .trim();

    // Add period if missing
    if (correctedText && !correctedText.match(/[.!?]$/)) {
      correctedText += '.';
    }

    const changes = text !== correctedText ? [
      { type: 'grammar', description: 'Fixed capitalization and punctuation' }
    ] : [];

    res.json({
      success: true,
      originalText: text,
      correctedText,
      changes,
      confidence: 0.9,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Proofreading error:', error);
    res.status(500).json({
      success: false,
      error: 'Proofreading service unavailable',
      message: error.message
    });
  }
});

app.post('/api/ai/detect-language', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Simple language detection based on character patterns
    const patterns = {
      'es': /[ñáéíóúü]/i,
      'fr': /[àâäçéèêëïîôöùûüÿ]/i,
      'de': /[äöüß]/i,
      'it': /[àèéìíîòóù]/i,
      'pt': /[ãâêôõç]/i,
      'ru': /[абвгдеёжзийклмнопрстуфхцчшщъыьэюя]/i,
    };

    let detectedLanguage = 'en'; // Default to English
    let confidence = 0.5;

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        detectedLanguage = lang;
        confidence = 0.8;
        break;
      }
    }

    res.json({
      success: true,
      text,
      detectedLanguage,
      confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Language detection service unavailable',
      message: error.message
    });
  }
});

// Static file serving (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Setup Socket.IO handlers
setupSocket(io);

// Connect to database
if (process.env.MONGODB_URI) {
  connectDB().catch(console.error);
} else {
  console.log('MongoDB URI not provided, running without database');
}

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`
🚀 LinguaLive Server is running!
📍 URL: http://${HOST}:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}
📊 Health check: http://${HOST}:${PORT}/health
${process.env.MONGODB_URI ? '🗄️  Database: Connected' : '🗄️  Database: Not configured'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = { app, server, io };