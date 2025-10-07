import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
    headers: {
      // Headers required for Zoom SDK Cross-Origin security
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    proxy: {
      // Proxy ALL API requests to backend (Solution 2: Frontend Proxy)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket support
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxying API request:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ API response:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ Proxy error:', err.message);
          });
        }
      },
      
      // Specific proxy for Zoom SDK requests to fix MIME type issues
      '/zoom-sdk': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zoom-sdk/, '/api/zoom/sdk'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxying Zoom SDK request:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Add Cross-Origin headers to proxied responses
            proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
            proxyRes.headers['cross-origin-opener-policy'] = 'same-origin';
            proxyRes.headers['cross-origin-embedder-policy'] = 'require-corp';
          });
        }
      },
      
      // Proxy health checks
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          zoom: ['@zoomus/websdk']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@zoomus/websdk'],
    exclude: ['@zoom/meetingsdk'],
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      global: 'globalThis'
    }
  }
})
