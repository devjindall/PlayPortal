import api from './api';

export const getSubmissions = async ({ status = '', page = 1, limit = 20 } = {}) => {
  const response = await api.get('/admin/submissions', { params: { status, page, limit } });
  return response.data;
};

export const getSubmissionById = async (submissionId) => {
  const response = await api.get(`/admin/submissions/${submissionId}`);
  return response.data.data;
};

export const approveSubmission = async (submissionId) => {
  const response = await api.patch(`/admin/submissions/${submissionId}/approve`);
  return response.data;
};

export const rejectSubmission = async (submissionId, rejectionReason) => {
  const response = await api.patch(`/admin/submissions/${submissionId}/reject`, { rejectionReason });
  return response.data;
};

export const getUsers = async ({ search = '', role = '', page = 1, limit = 20 } = {}) => {
  const response = await api.get('/admin/users', { params: { search, role, page, limit } });
  return response.data;
};

export const toggleUserStatus = async (userId, isActive) => {
  const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
  return response.data;
};
