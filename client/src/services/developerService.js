import api from './api';

export const uploadGame = async (formData) => {
  const response = await api.post('/developer/games', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMyGames = async () => {
  const response = await api.get('/developer/games');
  return response.data.data;
};

export const getMyGameDetails = async (gameId) => {
  const response = await api.get(`/developer/games/${gameId}`);
  return response.data.data;
};

export const updateMyGame = async (gameId, updates) => {
  const response = await api.patch(`/developer/games/${gameId}`, updates);
  return response.data.data;
};
