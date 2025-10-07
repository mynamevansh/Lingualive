// ReactDOM Fix Verification Script
// This script tests the Zoom SDK ReactDOM dependency resolution

console.log('🧪 Starting ReactDOM Fix Verification...');

// Test 1: Check current React/ReactDOM availability
console.log('\n=== Test 1: Current Global State ===');
console.log('React available globally:', !!window.React);
console.log('ReactDOM available globally:', !!window.ReactDOM);
console.log('ZoomMtg available:', !!window.ZoomMtg);

// Test 2: Import and make React/ReactDOM global
async function makeReactGlobal() {
    console.log('\n=== Test 2: Making React/ReactDOM Global ===');
    
    try {
        if (!window.React) {
            console.log('Importing React...');
            const React = await import('react');
            window.React = React.default || React;
            console.log('✅ React made global:', !!window.React);
        }
        
        if (!window.ReactDOM) {
            console.log('Importing ReactDOM...');
            const ReactDOM = await import('react-dom');
            window.ReactDOM = ReactDOM.default || ReactDOM;
            console.log('✅ ReactDOM made global:', !!window.ReactDOM);
        }
        
        console.log('React version:', window.React?.version || 'unknown');
        console.log('ReactDOM render method:', typeof window.ReactDOM?.render);
        
    } catch (error) {
        console.error('❌ Failed to import React/ReactDOM:', error);
    }
}

// Test 3: Load scripts via proxy
async function loadScriptViaProxy(src, id) {
    console.log(`\n=== Loading ${id} ===`);
    
    return new Promise((resolve, reject) => {
        const existing = document.getElementById(id);
        if (existing) {
            console.log(`Removing existing script: ${id}`);
            existing.remove();
        }
        
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.type = 'application/javascript';
        script.crossOrigin = 'use-credentials';
        
        script.onload = () => {
            console.log(`✅ ${id} loaded successfully`);
            resolve();
        };
        
        script.onerror = (error) => {
            console.error(`❌ ${id} failed to load:`, error);
            reject(new Error(`Failed to load ${id}`));
        };
        
        console.log(`Loading: ${src}`);
        document.head.appendChild(script);
        
        setTimeout(() => {
            reject(new Error(`Timeout loading ${id}`));
        }, 15000);
    });
}

// Test 4: Full Zoom SDK loading test
async function testFullZoomSDKLoad() {
    console.log('\n🚀 === Full Zoom SDK Load Test ===');
    
    try {
        // Step 1: Make React/ReactDOM global
        await makeReactGlobal();
        
        // Step 2: Load React via proxy
        await loadScriptViaProxy(
            'http://localhost:3001/api/zoom/sdk/2.16.0/lib/vendor/react.min.js', 
            'react-proxy-test'
        );
        
        // Step 3: Load ReactDOM via proxy
        await loadScriptViaProxy(
            'http://localhost:3001/api/zoom/sdk/2.16.0/lib/vendor/react-dom.min.js', 
            'reactdom-proxy-test'
        );
        
        // Step 4: Verify dependencies before Zoom SDK
        console.log('\n=== Dependency Verification ===');
        console.log('React available:', !!window.React);
        console.log('ReactDOM available:', !!window.ReactDOM);
        
        if (!window.React || !window.ReactDOM) {
            throw new Error('React/ReactDOM not available after loading');
        }
        
        // Step 5: Load Zoom SDK
        await loadScriptViaProxy(
            'http://localhost:3001/api/zoom/sdk/2.16.0/zoom-meeting-2.16.0.min.js',
            'zoom-sdk-test'
        );
        
        // Step 6: Check ZoomMtg availability
        console.log('\n=== Final Verification ===');
        if (window.ZoomMtg) {
            console.log('🎉 SUCCESS! ZoomMtg is available');
            console.log('ZoomMtg methods:', Object.keys(window.ZoomMtg).slice(0, 10));
            console.log('✅ ReactDOM fix is working!');
            return true;
        } else {
            console.error('❌ ZoomMtg still not available');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Full SDK test failed:', error);
        return false;
    }
}

// Test 5: Backend proxy health check
async function testBackendProxy() {
    console.log('\n=== Backend Proxy Health Check ===');
    
    const endpoints = [
        'http://localhost:3001/health',
        'http://localhost:3001/api/zoom/sdk/2.16.0/lib/vendor/react.min.js',
        'http://localhost:3001/api/zoom/sdk/2.16.0/lib/vendor/react-dom.min.js',
        'http://localhost:3001/api/zoom/sdk/2.16.0/zoom-meeting-2.16.0.min.js'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, { method: 'HEAD' });
            console.log(`${response.ok ? '✅' : '❌'} ${endpoint} - ${response.status}`);
        } catch (error) {
            console.log(`❌ ${endpoint} - ${error.message}`);
        }
    }
}

// Run all tests
async function runAllTests() {
    console.log('🔬 Running comprehensive ReactDOM fix verification...\n');
    
    // Run tests sequentially
    await makeReactGlobal();
    await testBackendProxy();
    const success = await testFullZoomSDKLoad();
    
    console.log('\n' + '='.repeat(50));
    console.log(success ? 
        '🎉 ALL TESTS PASSED - ReactDOM fix is working!' : 
        '❌ TESTS FAILED - ReactDOM issue persists'
    );
    console.log('='.repeat(50));
    
    return success;
}

// Auto-run tests when script loads
runAllTests().catch(console.error);

// Make functions available globally for manual testing
window.testZoomSDK = {
    runAllTests,
    makeReactGlobal,
    testFullZoomSDKLoad,
    testBackendProxy,
    loadScriptViaProxy
};

console.log('\n💡 Manual test functions available at: window.testZoomSDK');