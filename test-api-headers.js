

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

// Expected output:
// Content-Type: application/json
// Authorization: Bearer test-token-12345
