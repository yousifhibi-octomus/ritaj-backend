import axios from 'axios';
import djangoAPI from './axios';

// Ensure baseURL is set (NEXT_PUBLIC_DJANGO_API_URL) e.g. http://localhost:8000/api/

export async function getCSRFToken() {
  // We hit the backend csrf endpoint which sets the cookie and returns token
  const res = await djangoAPI.get('auth/csrf/', { withCredentials: true });
  return res.data.csrfToken;
}

export async function login({ username, email, password }) {
  await getCSRFToken();
  const payload = { password };
  if (username) payload.username = username;
  if (email && !username) payload.email = email; // allow either
  const res = await djangoAPI.post('auth/login/', payload, { withCredentials: true });
  return res.data;
}

export async function logout() {
  await getCSRFToken(); // refresh token to satisfy CSRF for POST
  const res = await djangoAPI.post('auth/logout/', {}, { withCredentials: true });
  return res.data;
}

export async function fetchAuthStatus() {
  const res = await djangoAPI.get('auth/status/', { withCredentials: true });
  return res.data;
}
