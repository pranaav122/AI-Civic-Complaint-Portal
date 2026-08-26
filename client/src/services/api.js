const API_BASE = import.meta.env.VITE_API_URL || '/api';
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Auto-set Content-Type for JSON, unless it's FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

// Config
export const getConfig = () => fetchWithAuth('/config');

// Auth
export const login = (email, password) => fetchWithAuth('/auth/login', { method: 'POST', body: { email, password } });
export const register = (data) => fetchWithAuth('/auth/register', { method: 'POST', body: data });
export const getMe = () => fetchWithAuth('/auth/me');

// Complaints
export const submitComplaint = (formData) => fetchWithAuth('/complaints', { method: 'POST', body: formData });
export const getComplaints = (params) => {
  const qs = new URLSearchParams(params || {}).toString();
  return fetchWithAuth(`/complaints${qs ? `?${qs}` : ''}`);
};
export const getComplaint = (id) => fetchWithAuth(`/complaints/${id}`);
export const updateComplaint = (id, data) => fetchWithAuth(`/complaints/${id}`, { method: 'PUT', body: data });
export const verifyComplaint = (id, data) => fetchWithAuth(`/complaints/${id}/verify`, { method: 'POST', body: data });
export const verifyResolution = (id, data) => fetchWithAuth(`/complaints/${id}/verify`, { method: 'POST', body: data });
export const getSimilarComplaints = (id) => fetchWithAuth(`/complaints/${id}/similar`);
export const addComplaintNote = (id, data) => fetchWithAuth(`/admin/complaints/${id}/note`, { method: 'POST', body: data });
export const assignComplaint = (id, data) => fetchWithAuth(`/admin/complaints/${id}/assign`, { method: 'POST', body: data });

// Departments
export const getDepartments = () => fetchWithAuth('/departments');
export const createDepartment = (data) => fetchWithAuth('/departments', { method: 'POST', body: data });
export const updateDepartment = (id, data) => fetchWithAuth(`/departments/${id}`, { method: 'PUT', body: data });
export const deleteDepartment = (id) => fetchWithAuth(`/departments/${id}`, { method: 'DELETE' });

// Schemes
export const getSchemes = () => fetchWithAuth('/schemes');
export const findSchemes = (profile) => fetchWithAuth('/schemes/find', { method: 'POST', body: profile });
export const createScheme = (data) => fetchWithAuth('/schemes', { method: 'POST', body: data });
export const updateScheme = (id, data) => fetchWithAuth(`/schemes/${id}`, { method: 'PUT', body: data });

// Analytics
export const getAnalyticsOverview = () => fetchWithAuth('/analytics/overview');
export const getAnalyticsByCategory = () => fetchWithAuth('/analytics/by-category');
export const getAnalyticsByArea = () => fetchWithAuth('/analytics/by-area');
export const getAnalyticsTrends = () => fetchWithAuth('/analytics/trends');
export const getAnalyticsHeatmap = () => fetchWithAuth('/analytics/heatmap');
export const getPublicAnalytics = () => fetchWithAuth('/analytics/public');
export const getAnalyticsByDepartment = () => fetchWithAuth('/analytics/by-department');
export const getPriorityDistribution = () => fetchWithAuth('/analytics/priority-distribution');
export const getDepartmentPerformance = () => fetchWithAuth('/analytics/department-performance');

// Users
export const getAdminUsers = (params) => {
  const qs = new URLSearchParams(params || {}).toString();
  return fetchWithAuth(`/users${qs ? `?${qs}` : ''}`);
};
export const updateUserRole = (id, role) => fetchWithAuth(`/users/${id}/role`, { method: 'PUT', body: { role } });

// Notifications
export const getNotifications = () => fetchWithAuth('/notifications');
export const markNotificationRead = (id) => fetchWithAuth(`/notifications/${id}/read`, { method: 'PUT' });
