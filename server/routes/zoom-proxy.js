const express = require('express');
const axios = require('axios');
const router = express.Router();

// Zoom CDN proxy to fix MIME type and 403 issues
const ZOOM_CDN_BASE = 'https://source.zoom.us';

// Cache for Zoom SDK files to reduce CDN requests
const sdkCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Handle CORS preflight requests for Zoom SDK files
 */
router.options('/sdk/*', (req, res) => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.status(200).end();
});

/**
 * Proxy route for Zoom SDK files
 * Fixes MIME type issues and 403 errors from Zoom CDN
 */
router.get('/sdk/*', async (req, res) => {
  try {
    const sdkPath = req.params[0];
    const fullUrl = `${ZOOM_CDN_BASE}/${sdkPath}`;
    
    console.log(`🔄 Zoom SDK Proxy Request: ${sdkPath}`);
    
    // Check cache first
    const cacheKey = sdkPath;
    const cached = sdkCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`✅ Serving from cache: ${sdkPath}`);
      res.set(cached.headers);
      return res.send(cached.data);
    }
    
    // Fetch from Zoom CDN with proper headers
    const response = await axios({
      method: 'GET',
      url: fullUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://lingualive.app/',
        'Origin': 'https://lingualive.app',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'script',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      timeout: 30000,
      responseType: 'text'
    });
    
    // Determine correct MIME type based on file extension
    let contentType = 'application/javascript';
    if (sdkPath.endsWith('.js')) {
      contentType = 'application/javascript; charset=utf-8';
    } else if (sdkPath.endsWith('.css')) {
      contentType = 'text/css; charset=utf-8';
    } else if (sdkPath.endsWith('.wasm')) {
      contentType = 'application/wasm';
    } else if (sdkPath.endsWith('.json')) {
      contentType = 'application/json; charset=utf-8';
    }
    
    // Set proper headers to fix MIME type and Cross-Origin issues
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
    const origin = req.headers.origin;
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Length': Buffer.byteLength(response.data, 'utf8')
    };
    
    // Cache the response
    sdkCache.set(cacheKey, {
      data: response.data,
      headers: headers,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries
    if (sdkCache.size > 50) {
      const oldestKey = sdkCache.keys().next().value;
      sdkCache.delete(oldestKey);
    }
    
    console.log(`✅ Zoom SDK file served: ${sdkPath} (${contentType})`);
    
    res.set(headers);
    res.send(response.data);
    
  } catch (error) {
    console.error(`❌ Zoom SDK Proxy Error for ${req.params[0]}:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });
    
    // Return a helpful error response
    res.status(error.response?.status || 500).json({
      error: 'Zoom SDK Proxy Error',
      message: error.message,
      path: req.params[0],
      status: error.response?.status || 500,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Health check for zoom proxy
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'zoom-proxy',
    cache_size: sdkCache.size,
    timestamp: new Date().toISOString()
  });
});

/**
 * Clear zoom SDK cache
 */
router.post('/clear-cache', (req, res) => {
  const cacheSize = sdkCache.size;
  sdkCache.clear();
  
  console.log(`🗑️ Cleared Zoom SDK cache (${cacheSize} items)`);
  
  res.json({
    message: 'Zoom SDK cache cleared',
    cleared_items: cacheSize,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get cache status
 */
router.get('/cache-status', (req, res) => {
  const cacheEntries = Array.from(sdkCache.entries()).map(([key, value]) => ({
    path: key,
    size: Buffer.byteLength(value.data, 'utf8'),
    cached_at: new Date(value.timestamp).toISOString(),
    age_minutes: Math.round((Date.now() - value.timestamp) / (1000 * 60))
  }));
  
  res.json({
    cache_size: sdkCache.size,
    total_cached_bytes: cacheEntries.reduce((sum, entry) => sum + entry.size, 0),
    entries: cacheEntries,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;