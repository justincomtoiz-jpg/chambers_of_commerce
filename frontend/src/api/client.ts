import axios from 'axios';

// Default API client pointing at the backend used in the project.
// If your backend runs on a different host/port, update this value.
const api = axios.create({
  baseURL: 'http://localhost:3001', // original backend mock port
  headers: { 'Content-Type': 'application/json' }
});

export default api;
