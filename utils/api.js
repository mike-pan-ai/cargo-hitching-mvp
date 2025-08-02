// utils/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_API_URL || 'https://cargo-hitching-backend-production.up.railway.app'
  : 'http://localhost:5000';

export default API_BASE_URL;