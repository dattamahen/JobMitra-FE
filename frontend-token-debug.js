// Browser console test script
// Run this in browser console after HR login

console.log('🔍 FRONTEND TOKEN DEBUG TEST');
console.log('=' * 40);

// Check what's in localStorage
console.log('localStorage contents:');
console.log('- jobmitra_token:', localStorage.getItem('jobmitra_token'));
console.log('- access_token:', localStorage.getItem('access_token'));

// Test the API service createHeaders logic
function testCreateHeaders() {
    // Simulate the API service createHeaders method
    const headers = new Map();
    headers.set('Content-Type', 'application/json');
    
    const token = localStorage.getItem('jobmitra_token');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        console.log('✅ Authorization header would be set');
        console.log('   Token (first 30 chars):', token.substring(0, 30) + '...');
    } else {
        console.log('❌ No token found - Authorization header would NOT be set');
    }
    
    return headers;
}

const testHeaders = testCreateHeaders();
console.log('\nGenerated headers:');
testHeaders.forEach((value, key) => {
    console.log(`- ${key}: ${key === 'Authorization' ? value.substring(0, 50) + '...' : value}`);
});

// If token exists, test a manual API call
const token = localStorage.getItem('jobmitra_token');
if (token) {
    console.log('\n🧪 Testing manual API call...');
    
    fetch('http://localhost:8000/api/v1/hr/dashboard', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        console.log(`API Response Status: ${response.status}`);
        if (response.ok) {
            return response.json();
        } else {
            console.log('❌ API call failed');
            return response.text();
        }
    })
    .then(data => {
        console.log('API Response Data:', data);
    })
    .catch(error => {
        console.log('API Error:', error);
    });
}
