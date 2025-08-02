// utils/api.js
const API_BASE_URL = typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
  ? 'cargo-hitching-backend-production.up.railway.app'  // Replace with your real Railway URL
  : 'http://localhost:5000';

export default API_BASE_URL;