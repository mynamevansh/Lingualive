// Test script to verify Zoom SDK loading and functionality
import simpleZoomService from '../services/simpleZoomService.js';

const runZoomSDKTests = async () => {
  console.log('🧪 Starting Zoom SDK Tests...\n');
  
  const tests = [
    {
      name: 'SDK Initialization',
      test: async () => {
        console.log('Testing SDK initialization...');
        const result = await simpleZoomService.initialize({
          debug: true,
          leaveUrl: 'http://localhost:5174/',
          showMeetingHeader: false,
          disablePreview: false,
          disableInvite: true
        });
        return result;
      }
    },
    
    {
      name: 'Create Meeting (Development Mode)',
      test: async () => {
        console.log('Testing meeting creation...');
        const meeting = await simpleZoomService.createMeeting({
          topic: 'Test Meeting',
          duration: 30
        });
        return meeting && meeting.id;
      }
    },
    
    {
      name: 'SDK Status Check',
      test: async () => {
        console.log('Testing SDK status...');
        return simpleZoomService.getSDKStatus();
      }
    }
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`\n🔄 Running: ${test.name}`);
      const startTime = Date.now();
      const result = await test.test();
      const endTime = Date.now();
      
      const success = result !== false && result !== null && result !== undefined;
      results.push({
        name: test.name,
        success,
        result,
        duration: endTime - startTime
      });
      
      console.log(`${success ? '✅' : '❌'} ${test.name}: ${success ? 'PASSED' : 'FAILED'}`);
      console.log(`   Result: ${JSON.stringify(result)}`);
      console.log(`   Duration: ${endTime - startTime}ms`);
      
    } catch (error) {
      results.push({
        name: test.name,
        success: false,
        error: error.message,
        duration: 0
      });
      
      console.log(`❌ ${test.name}: FAILED`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
  });
  
  console.log('='.repeat(50));
  console.log(`Results: ${passed}/${total} tests passed`);
  console.log(`Overall: ${passed === total ? '✅ SUCCESS' : '⚠️ SOME FAILURES'}`);
  
  return {
    passed,
    total,
    success: passed === total,
    results
  };
};

// Function to test specific SDK features
const testSDKFeatures = () => {
  console.log('\n🔍 SDK Feature Detection:');
  
  // Check for window.ZoomMtg
  if (typeof window !== 'undefined' && window.ZoomMtg) {
    console.log('✅ ZoomMtg detected in window object');
    console.log(`   Version: ${window.ZoomMtg.version || 'Unknown'}`);
    
    // Test basic methods
    const methods = ['init', 'join', 'leave', 'getCurrentUser', 'getAttendeeslist'];
    methods.forEach(method => {
      if (typeof window.ZoomMtg[method] === 'function') {
        console.log(`   ✅ ${method}() method available`);
      } else {
        console.log(`   ❌ ${method}() method missing`);
      }
    });
  } else {
    console.log('❌ ZoomMtg not found in window object');
  }
  
  // Check for CDN script presence
  const cdnScript = document.querySelector('script[src*="zoom.us"]');
  if (cdnScript) {
    console.log('✅ Zoom CDN script detected');
    console.log(`   Source: ${cdnScript.src}`);
  } else {
    console.log('❌ Zoom CDN script not found');
  }
};

// Export for use in browser console or components
export { runZoomSDKTests, testSDKFeatures };

// Auto-run when loaded in browser
if (typeof window !== 'undefined') {
  window.testZoomSDK = async () => {
    testSDKFeatures();
    return await runZoomSDKTests();
  };
  
  console.log('🧪 Zoom SDK Test Suite loaded!');
  console.log('   Run window.testZoomSDK() to execute tests');
}

export default {
  runTests: runZoomSDKTests,
  testFeatures: testSDKFeatures
};