import axios from 'axios';

function buildApiBase() {
  const raw = (process.env.NEXT_PUBLIC_DJANGO_API_URL || '').trim().replace(/\/$/, '');
  if (!raw) return 'http://localhost:8000/api/';
  const hasApi = /\/api$/.test(raw);
  const base = hasApi ? raw : `${raw}/api`;
  return base.endsWith('/') ? base : `${base}/`;
}

const djangoAPI = axios.create({
  baseURL: buildApiBase(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to read cookie value (simple parse)
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Attach CSRF token for unsafe methods
djangoAPI.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = getCookie('csrftoken');
    if (token) {
      config.headers['X-CSRFToken'] = token;
    }
  }
  return config;
});

// Optionally, attempt to pre-fetch CSRF token if none exists yet when first import occurs
if (typeof document !== 'undefined' && !getCookie('csrftoken')) {
  // Fire and forget CSRF prefetch using the same normalized base
  fetch(buildApiBase() + 'auth/csrf/', { credentials: 'include' }).catch(() => {});
}

export default djangoAPI;