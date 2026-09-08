import api from './api';

export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.user;
};

export const updateProfile = async (data) => {
  const response = await api.patch('/users/me', data);
  return response.data.user;
};

export const getMyHistory = async () => {
  const response = await api.get('/users/me/history');
  return response.data.data;
};
