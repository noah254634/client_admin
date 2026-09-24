import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = (() => {
  if (!configuredApiUrl) return '/api';

  const withProtocol = configuredApiUrl.startsWith('/') || configuredApiUrl.includes('://')
    ? configuredApiUrl
    : `https://${configuredApiUrl}`;
  const normalized = withProtocol.replace(/\/$/, '');

  return normalized === '/api' || normalized.endsWith('/api')
    ? normalized
    : `${normalized}/api`;
})();

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getApiErrorMessage = (error) => {
  const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error?.message;

  if (typeof message === 'string' && message.trim()) return message;
  if (message && typeof message === 'object') {
    if (typeof message.message === 'string' && message.message.trim()) return message.message;
    if (typeof message.code === 'string' && message.code.trim()) return message.code;
  }

  return 'An unexpected server error occurred.';
};

let globalErrorHandler = null;

export const setGlobalErrorHandler = (fn) => {
  globalErrorHandler = fn;
};

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle errors globally and show the error modal
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginEndpoint = err.config?.url?.includes('/auth/login');
    const status = err.response?.status;

    // Handle 401 unauthorized (except on login page itself)
    if (status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    if (globalErrorHandler) {
      const message = getApiErrorMessage(err);

      const title =
        status === 500
          ? 'Server Error (500)'
          : status === 401
          ? 'Invalid Credentials'
          : status === 403
          ? 'Access Forbidden (403)'
          : status === 404
          ? 'Resource Not Found (404)'
          : !err.response
          ? 'Network Connection Failure'
          : 'Request Error';

      globalErrorHandler({
        title,
        message,
        status,
        endpoint: err.config?.url,
        details: err.response?.data || err.stack || err.message,
      });
    }

    return Promise.reject(err);
  }
);

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const getProjects   = ()           => api.get('/projects?includeArchived=true').then((r) => r.data.data ?? r.data);
export const getProject    = (slug)       => api.get(`/projects/${slug}?includeArchived=true`).then((r) => r.data.data ?? r.data);
export const createProject = (data)       => api.post('/projects', data).then((r) => r.data.data ?? r.data);
export const updateProject = (slug, data) => api.patch(`/projects/${slug}`, data).then((r) => r.data.data ?? r.data);
export const deleteProject = (slug)       => api.delete(`/projects/${slug}`).then((r) => r.data);

export const getDecisions   = (slug)       => api.get(`/projects/${slug}/decisions`).then((r) => r.data.data ?? r.data);
export const createDecision = (slug, data) => api.post(`/projects/${slug}/decisions`, data).then((r) => r.data.data ?? r.data);
export const deleteDecision = (slug, id)   => api.delete(`/projects/${slug}/decisions/${id}`).then((r) => r.data);

export const getMessages   = ()   => api.get('/messages').then((r) => r.data.data ?? r.data);
export const deleteMessage = (id) => api.delete(`/messages/${id}`).then((r) => r.data);

export const getArticles   = ()     => api.get('/articles').then((r) => r.data.data ?? r.data);
export const createArticle = (data) => api.post('/articles', data).then((r) => r.data.data ?? r.data);

export const getTestimonials = () =>
  api.get('/testimonials?includeUnpublished=true').then((r) => r.data.data ?? r.data);
export const createTestimonial = (data) =>
  api.post('/testimonials', data).then((r) => r.data.data ?? r.data);
export const updateTestimonial = (id, data) =>
  api.patch(`/testimonials/${id}`, data).then((r) => r.data.data ?? r.data);
export const deleteTestimonial = (id) => api.delete(`/testimonials/${id}`).then((r) => r.data);
export const uploadTestimonialAvatar = (formData) =>
  api.post('/testimonials/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const getTechnologies = () => api.get('/technologies').then((r) => r.data.data ?? r.data);

export const getProjectImages = (slug) =>
  api.get(`/projects/${slug}/images`).then((r) => r.data.data ?? r.data);

export const uploadProjectImage = (slug, formData) =>
  api.post(`/projects/${slug}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.data ?? r.data);

export const updateProjectImage = (slug, imageId, data) =>
  api.patch(`/projects/${slug}/images/${imageId}`, data).then((r) => r.data.data ?? r.data);

export const deleteProjectImage = (slug, imageId) =>
  api.delete(`/projects/${slug}/images/${imageId}`).then((r) => r.data);

export const getProfile = () =>
  api.get('/profile').then((r) => r.data.data ?? r.data);

export const updateProfile = (data) =>
  api.patch('/profile', data).then((r) => r.data.data ?? r.data);

export const uploadAvatar = (formData) =>
  api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const uploadCv = (formData) =>
  api.post('/profile/cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export default api;
