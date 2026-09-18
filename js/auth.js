import { getSupabase } from './supabase.js';

// Admin Sign In
export async function adminSignIn(email, password) {
  const client = getSupabase();
  if (client) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  }
  
  // Fallback demo sign-in for testing before Supabase connection
  if (email === 'admin@beyondbites.com' && password === 'admin123') {
    const fakeSession = { user: { email }, expires_at: Date.now() + 86400000 };
    localStorage.setItem('beyond_bites_demo_session', JSON.stringify(fakeSession));
    return fakeSession;
  } else {
    throw new Error('Invalid credentials. Use admin@beyondbites.com / admin123 for demo mode or configure Supabase.');
  }
}

// Admin Sign Out
export async function adminSignOut() {
  const client = getSupabase();
  if (client) {
    const { error } = await client.auth.signOut();
    if (error) console.error('Sign out error:', error);
  }
  localStorage.removeItem('beyond_bites_demo_session');
  window.location.reload();
}

// Check Active Session
export async function getAdminSession() {
  const client = getSupabase();
  if (client) {
    const { data } = await client.auth.getSession();
    return data.session;
  }
  
  const demoSession = localStorage.getItem('beyond_bites_demo_session');
  return demoSession ? JSON.parse(demoSession) : null;
}

// Listen to Auth State Changes
export function onAuthStateChange(callback) {
  const client = getSupabase();
  if (client) {
    return client.auth.onAuthStateChange((event, session) => {
      callback(session);
    });
  }
}
