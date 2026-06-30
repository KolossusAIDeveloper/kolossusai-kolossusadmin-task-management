import axios from 'axios';

const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getTasks = (params = {}) => api.get('/tasks/', { params });
export const getTask = (id) => api.get(`/tasks/${id}/`);
export const createTask = (data) => api.post('/tasks/', data);
export const updateTask = (id, data) => api.patch(`/tasks/${id}/`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}/`);
export const getComments = (taskId) => api.get(`/tasks/${taskId}/comments/`);
export const addComment = (taskId, data) => api.post(`/tasks/${taskId}/comments/`, data);
export const deleteComment = (id) => api.delete(`/comments/${id}/`);
