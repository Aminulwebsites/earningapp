// Force authentication by logging in the admin user and storing session
export async function ensureAuthentication() {
  const savedSessionId = localStorage.getItem('sessionId');
  const savedUser = localStorage.getItem('user');
  
  // If we already have valid session data, return
  if (savedSessionId && savedUser) {
    return { sessionId: savedSessionId, user: JSON.parse(savedUser) };
  }
  
  try {
    // Automatically login admin user to ensure authentication
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('sessionId', data.sessionId);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    }
  } catch (error) {
    console.error('Auto-authentication failed:', error);
  }
  
  return { sessionId: null, user: null };
}

// Update localStorage with authentication data
export function updateAuthData(sessionId: string, user: any) {
  localStorage.setItem('sessionId', sessionId);
  localStorage.setItem('user', JSON.stringify(user));
}