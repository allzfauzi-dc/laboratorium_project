import { reactive, computed } from 'vue';

const AUTH_KEY = 'simrs_lab_user';
const TOKEN_KEY = 'simrs_lab_token';

// Load saved session from localStorage if present
let initialUser = null;
try {
  const saved = localStorage.getItem(AUTH_KEY);
  if (saved) {
    initialUser = JSON.parse(saved);
  }
} catch (e) {
  initialUser = null;
}

const state = reactive({
  user: initialUser,
  token: localStorage.getItem(TOKEN_KEY) || null,
  loginError: ''
});

export const authState = {
  user: computed(() => state.user),
  token: computed(() => state.token),
  isAuthenticated: computed(() => !!state.user && !!state.token),
  userRole: computed(() => state.user?.role || ''),
  userName: computed(() => state.user?.name || ''),
  roleTitle: computed(() => state.user?.roleTitle || ''),
  allowedRoutes: computed(() => state.user?.allowedRoutes || []),

  // Check if current user has access to a given path
  canAccess(path) {
    if (!state.user) return false;
    if (state.user.role === 'ADMIN') return true;
    
    // Normalize path (e.g. /cetak-hasil/123 -> /cetak-hasil)
    const basePath = '/' + path.split('/')[1];
    
    if (state.user.allowedRoutes.includes(path) || state.user.allowedRoutes.includes(basePath)) {
      return true;
    }
    return false;
  },

  async login(username, password) {
    state.loginError = '';
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server backend (port 5000) belum berjalan atau tidak merespons JSON. Silakan jalankan backend via run.bat.');
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      state.user = data.data.user;
      state.token = data.data.token;

      localStorage.setItem(AUTH_KEY, JSON.stringify(data.data.user));
      localStorage.setItem(TOKEN_KEY, data.data.token);

      return data.data.user;
    } catch (err) {
      let message = err.message || 'Login gagal';
      if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        if (isHttps) {
          message = 'Gagal terhubung ke Backend API. Aplikasi berjalan di HTTPS (Vercel), tetapi server backend cloud belum dihubungkan ke VITE_API_URL.';
        } else {
          message = 'Gagal terhubung ke Server Backend (port 5000). Pastikan backend sudah dinyalakan (jalankan run.bat atau npm start di backend).';
        }
      }
      state.loginError = message;
      throw new Error(message);
    }
  },

  logout() {
    state.user = null;
    state.token = null;
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
};
