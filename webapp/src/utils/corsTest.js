// CORS Solutions Test - Choose Your Approach
// This file demonstrates both methods to fix CORS issues

// ========================================
// METHOD 1: Direct API Calls (Server-Side CORS)
// ========================================
// Use this when your server has proper CORS configuration
// The server allows cross-origin requests from your frontend

export const directAPICall = async () => {
  try {
    console.log('🔄 Testing direct API call (server-side CORS)...');
    
    // Direct call to backend server on different port
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include' // Include cookies for authentication
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Direct API call successful:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Direct API call failed:', error.message);
    throw error;
  }
};

// ========================================
// METHOD 2: Proxy API Calls (Vite Proxy)
// ========================================
// Use this when you want Vite to handle CORS by proxying requests
// All /api requests get forwarded to your backend server

export const proxyAPICall = async () => {
  try {
    console.log('🔄 Testing proxy API call (Vite proxy)...');
    
    // Proxy call - Vite forwards this to http://localhost:3001/api/data
    const response = await fetch('/api/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
      // Note: credentials handled by proxy configuration
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Proxy API call successful:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Proxy API call failed:', error.message);
    throw error;
  }
};

// ========================================
// TEST BOTH METHODS
// ========================================
export const testBothMethods = async () => {
  console.log('🧪 Testing both CORS solutions...\n');
  
  // Test Method 1: Direct API call with server-side CORS
  try {
    console.log('--- METHOD 1: Server-Side CORS ---');
    await directAPICall();
  } catch (error) {
    console.error('Method 1 failed:', error.message);
  }
  
  console.log('\n');
  
  // Test Method 2: Vite proxy
  try {
    console.log('--- METHOD 2: Vite Proxy ---');
    await proxyAPICall();
  } catch (error) {
    console.error('Method 2 failed:', error.message);
  }
  
  console.log('\n🏁 CORS testing complete!');
};

// ========================================
// HEALTH CHECK FUNCTIONS
// ========================================
export const checkBackendHealth = async () => {
  try {
    // Test if backend is running
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/health`);
    const data = await response.json();
    console.log('✅ Backend server is running:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend server is not running:', error.message);
    return false;
  }
};

export const checkProxyHealth = async () => {
  try {
    // Test if Vite proxy is working
    const response = await fetch('/health');
    const data = await response.json();
    console.log('✅ Vite proxy is working:', data);
    return true;
  } catch (error) {
    console.error('❌ Vite proxy is not working:', error.message);
    return false;
  }
};

// ========================================
// USAGE EXAMPLES IN REACT COMPONENTS
// ========================================

/*
// Example 1: Using in a React component with server-side CORS
import { directAPICall } from './corsTest.js';

function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    directAPICall()
      .then(setData)
      .catch(console.error);
  }, []);
  
  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}

// Example 2: Using in a React component with Vite proxy
import { proxyAPICall } from './corsTest.js';

function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    proxyAPICall()
      .then(setData)
      .catch(console.error);
  }, []);
  
  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}

// Example 3: Test both methods
import { testBothMethods } from './corsTest.js';

function TestComponent() {
  const runTests = () => {
    testBothMethods();
  };
  
  return (
    <button onClick={runTests}>
      Test CORS Solutions
    </button>
  );
}
*/

// Make functions available globally for testing in browser console
if (typeof window !== 'undefined') {
  window.corsTest = {
    directAPICall,
    proxyAPICall,
    testBothMethods,
    checkBackendHealth,
    checkProxyHealth
  };
  
  console.log('🧪 CORS test functions available at: window.corsTest');
  console.log('📖 Available methods:');
  console.log('  - window.corsTest.directAPICall()');
  console.log('  - window.corsTest.proxyAPICall()');
  console.log('  - window.corsTest.testBothMethods()');
  console.log('  - window.corsTest.checkBackendHealth()');
  console.log('  - window.corsTest.checkProxyHealth()');
}