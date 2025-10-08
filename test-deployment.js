#!/usr/bin/env node

/**
 * Simple deployment test script
 * Run this after deploying to verify the fixes work correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const TEST_URL = process.argv[2] || 'https://your-app.vercel.app';
const TIMEOUT = 10000; // 10 seconds

console.log('🧪 Testing Blockchain Credentialing System Deployment...\n');

// Test 1: Check if site loads over HTTPS
function testHTTPS(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TIMEOUT);

    protocol.get(url, (res) => {
      clearTimeout(timeout);
      
      if (url.startsWith('https') && res.statusCode === 200) {
        console.log('✅ HTTPS Connection: PASS');
        console.log('   - Site loads over secure connection');
        console.log('   - Camera access should be available\n');
        resolve(true);
      } else if (!url.startsWith('https')) {
        console.log('❌ HTTPS Connection: FAIL');
        console.log('   - Site is not served over HTTPS');
        console.log('   - Camera access will be blocked\n');
        reject(new Error('Site not served over HTTPS'));
      } else {
        console.log('❌ HTTPS Connection: FAIL');
        console.log(`   - HTTP Status: ${res.statusCode}\n`);
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }).on('error', (err) => {
      clearTimeout(timeout);
      console.log('❌ HTTPS Connection: FAIL');
      console.log(`   - Error: ${err.message}\n`);
      reject(err);
    });
  });
}

// Test 2: Check if the app loads correctly
function testAppLoad(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TIMEOUT);

    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        clearTimeout(timeout);
        
        // Check for key indicators that the app loaded
        const hasReact = data.includes('react');
        const hasVite = data.includes('vite') || data.includes('@vitejs');
        const hasApp = data.includes('Blockchain-Credentialing-System') || data.includes('Ordinals');
        
        if (res.statusCode === 200 && (hasReact || hasVite || hasApp)) {
          console.log('✅ App Load: PASS');
          console.log('   - Application loads successfully');
          console.log('   - HTML content is served correctly\n');
          resolve(true);
        } else {
          console.log('❌ App Load: FAIL');
          console.log(`   - HTTP Status: ${res.statusCode}`);
          console.log('   - App content may not be loading properly\n');
          reject(new Error('App not loading correctly'));
        }
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      console.log('❌ App Load: FAIL');
      console.log(`   - Error: ${err.message}\n`);
      reject(err);
    });
  });
}

// Test 3: Check security headers
function testSecurityHeaders(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TIMEOUT);

    protocol.get(url, (res) => {
      clearTimeout(timeout);
      
      const headers = res.headers;
      const hasHTTPS = url.startsWith('https');
      const hasSecurityHeaders = headers['x-content-type-options'] || headers['x-frame-options'];
      
      if (hasHTTPS && hasSecurityHeaders) {
        console.log('✅ Security Headers: PASS');
        console.log('   - HTTPS enabled');
        console.log('   - Security headers present\n');
        resolve(true);
      } else if (hasHTTPS) {
        console.log('⚠️  Security Headers: PARTIAL');
        console.log('   - HTTPS enabled');
        console.log('   - Some security headers missing (not critical)\n');
        resolve(true);
      } else {
        console.log('❌ Security Headers: FAIL');
        console.log('   - HTTPS not enabled');
        console.log('   - Camera access will be blocked\n');
        reject(new Error('HTTPS not enabled'));
      }
    }).on('error', (err) => {
      clearTimeout(timeout);
      console.log('❌ Security Headers: FAIL');
      console.log(`   - Error: ${err.message}\n`);
      reject(err);
    });
  });
}

// Run all tests
async function runTests() {
  console.log(`🌐 Testing URL: ${TEST_URL}\n`);
  
  try {
    await testHTTPS(TEST_URL);
    await testAppLoad(TEST_URL);
    await testSecurityHeaders(TEST_URL);
    
    console.log('🎉 All tests passed!');
    console.log('\n📋 Manual Testing Checklist:');
    console.log('   1. Open the deployed site in a browser');
    console.log('   2. Navigate to the Verify page');
    console.log('   3. Check that "Secure connection (HTTPS) - Camera ready" is displayed');
    console.log('   4. Try the QR code scanner');
    console.log('   5. Verify the "Stop Scan" button closes the camera');
    console.log('   6. Test manual verification with a valid certificate ID');
    
  } catch (error) {
    console.log('❌ Some tests failed!');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure your site is deployed and accessible');
    console.log('   2. Check that HTTPS is enabled');
    console.log('   3. Verify environment variables are set correctly');
    console.log('   4. Check Vercel deployment logs for errors');
    console.log(`\n💡 Error: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line usage
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node test-deployment.js [URL]');
    console.log('Example: node test-deployment.js https://your-app.vercel.app');
    process.exit(0);
  }
  
  runTests().catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testHTTPS, testAppLoad, testSecurityHeaders };

