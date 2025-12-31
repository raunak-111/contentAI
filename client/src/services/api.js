import axios from 'axios';

const BASE_URL =
  import.meta.env.DEV
    ? 'http://localhost:5000/api' // Local backend during development
    : 'https://contentai-mmuz.onrender.com/api'; // Production backend

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Analytics API
export const analyticsAPI = {
  getOverview: (params) => api.get('/analytics/overview', { params }),
  getHeatmap: (params) => api.get('/analytics/heatmap', { params }),
  getTimeSeries: (params) => api.get('/analytics/timeseries', { params }),
  getTopPosts: (params) => api.get('/analytics/top-posts', { params }),
  getBestSlots: (params) => api.get('/analytics/best-slots', { params }),
  getPlatformBreakdown: (params) => api.get('/analytics/platforms', { params }),
};

// Posts API
export const postsAPI = {
  import: (posts) => api.post('/posts/import', { posts }),
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  delete: (id) => api.delete(`/posts/${id}`),
  clearAll: () => api.delete('/posts'),
};

// Scheduled Content API
export const scheduledAPI = {
  getAll: (params) => api.get('/scheduled', { params }),
  getCalendarEvents: (params) => api.get('/scheduled/calendar', { params }),
  getById: (id) => api.get(`/scheduled/${id}`),
  create: (data) => api.post('/scheduled', data),
  update: (id, data) => api.put(`/scheduled/${id}`, data),
  delete: (id) => api.delete(`/scheduled/${id}`),
  undoReschedule: (id) => api.post(`/scheduled/${id}/undo-reschedule`),
  applySuggestion: (id, suggestionIndex) => api.post(`/scheduled/${id}/apply-suggestion`, { suggestionIndex }),
};

// AI API
export const aiAPI = {
  generateHeadlines: (data) => api.post('/ai/headlines', data),
  rewriteContent: (data) => api.post('/ai/rewrite', data),
  explainTiming: (data) => api.post('/ai/explain-timing', data),
  classifyTone: (data) => api.post('/ai/classify-tone', data),
  getUsage: (params) => api.get('/ai/usage', { params }),
};

// Publish API
export const publishAPI = {
  publish: (id) => api.post(`/publish/${id}`),
  bulkPublish: (ids) => api.post('/publish/bulk', { ids }),
};

// Export API
export const exportAPI = {
  toCSV: (params) => api.get('/export/csv', { params, responseType: 'blob' }),
  toJSON: (params) => api.get('/export/json', { params, responseType: 'blob' }),
};

export default api;
