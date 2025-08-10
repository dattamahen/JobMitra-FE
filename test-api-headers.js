// Test script to verify API service includes Authorization headers
// This would normally be run in browser console after HR login

console.log('Testing API Service Authorization Headers...');

// Simulate token in localStorage (this happens after login)
localStorage.setItem('access_token', 'test-token-12345');

// Test the createHeaders method logic
const createHeaders = () => {
  let headers = new Headers({
    'Content-Type': 'application/json'
  });

  const token = localStorage.getItem('access_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
};

const testHeaders = createHeaders();
console.log('Generated headers:');
console.log('Content-Type:', testHeaders.get('Content-Type'));
console.log('Authorization:', testHeaders.get('Authorization'));

// Expected output:
// Content-Type: application/json
// Authorization: Bearer test-token-12345
