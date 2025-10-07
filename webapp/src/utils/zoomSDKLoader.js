// Zoom SDK CDN Loader - Fallback for compatibility issues
// This script loads Zoom SDK from CDN as a fallback

let sdkLoadPromise = null;

export const loadZoomSDKFromCDN = () => {
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.ZoomMtg) {
      console.log('✅ Zoom SDK already loaded from CDN');
      resolve(window.ZoomMtg);
      return;
    }

    console.log('🔄 Loading Zoom SDK from CDN...');

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://source.zoom.us/2.16.0/lib/vendor/zoom-meeting-2.16.0.min.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Zoom SDK loaded successfully from CDN');
      
      // Wait a bit for SDK to initialize
      setTimeout(() => {
        if (window.ZoomMtg) {
          resolve(window.ZoomMtg);
        } else {
          reject(new Error('ZoomMtg not available after CDN load'));
        }
      }, 1000);
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load Zoom SDK from CDN:', error);
      reject(new Error('Failed to load Zoom SDK from CDN'));
    };

    // Add to document head
    document.head.appendChild(script);

    // Timeout fallback
    setTimeout(() => {
      if (!window.ZoomMtg) {
        reject(new Error('Zoom SDK CDN load timeout'));
      }
    }, 15000);
  });

  return sdkLoadPromise;
};

// Alternative: Load via dynamic import with CDN fallback
export const loadZoomSDKDynamic = async () => {
  try {
    // Try npm package first
    console.log('🔄 Trying npm package import...');
    const zoomModule = await import('@zoomus/websdk');
    console.log('✅ Loaded via npm package');
    return zoomModule.ZoomMtg;
  } catch (npmError) {
    console.warn('⚠️ npm package failed, trying CDN fallback:', npmError.message);
    
    try {
      // Fallback to CDN
      return await loadZoomSDKFromCDN();
    } catch (cdnError) {
      console.error('❌ Both npm and CDN loading failed');
      throw new Error(`All SDK loading methods failed. npm: ${npmError.message}, CDN: ${cdnError.message}`);
    }
  }
};

// Initialize Zoom SDK with multiple fallback strategies
export const initializeZoomSDKRobust = async () => {
  const strategies = [
    {
      name: 'NPM Package',
      loader: async () => {
        const module = await import('@zoomus/websdk');
        return module.ZoomMtg;
      }
    },
    {
      name: 'Window Object',
      loader: async () => {
        if (window.ZoomMtg) return window.ZoomMtg;
        throw new Error('ZoomMtg not found on window');
      }
    },
    {
      name: 'CDN Fallback',
      loader: loadZoomSDKFromCDN
    }
  ];

  for (const strategy of strategies) {
    try {
      console.log(`🔄 Trying strategy: ${strategy.name}`);
      const ZoomMtg = await strategy.loader();
      
      if (ZoomMtg && typeof ZoomMtg === 'object') {
        console.log(`✅ Successfully loaded via ${strategy.name}`);
        return ZoomMtg;
      }
    } catch (error) {
      console.warn(`⚠️ Strategy ${strategy.name} failed:`, error.message);
    }
  }

  throw new Error('All Zoom SDK loading strategies failed');
};