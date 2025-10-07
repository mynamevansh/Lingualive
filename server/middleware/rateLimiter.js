const rateLimit = require('express-rate-limit');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict limiter for resource creation
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 creation requests per windowMs
  message: {
    success: false,
    message: 'Too many creation requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Room creation limiter
const createRoomLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 room creations per hour
  message: {
    success: false,
    message: 'Too many room creation attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Message sending limiter
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 messages per minute
  message: {
    success: false,
    message: 'Too many messages from this IP, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI service limiter
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 AI requests per minute
  message: {
    success: false,
    message: 'Too many AI service requests from this IP, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// User operations limiter
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 user operations per windowMs
  message: {
    success: false,
    message: 'Too many user operations from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 uploads per windowMs
  message: {
    success: false,
    message: 'Too many upload requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  general: generalLimiter,
  create: createLimiter,
  createRoom: createRoomLimiter,
  message: messageLimiter,
  ai: aiLimiter,
  user: userLimiter,
  auth: authLimiter,
  upload: uploadLimiter
};