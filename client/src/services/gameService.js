import api from './api';

export const getGames = async ({ search = '', category = '', page = 1, limit = 12, sort = 'popular' } = {}) => {
  const params = { search, category, page, limit, sort };
  const response = await api.get('/games', { params });
  return response.data;
};

export const getGameById = async (gameId) => {
  const response = await api.get(`/games/${gameId}`);
  return response.data.data;
};

export const getLeaderboard = async (gameId, limit = 20) => {
  const response = await api.get(`/games/${gameId}/leaderboard`, { params: { limit } });
  return response.data.data;
};

export const getMyGameScores = async (gameId) => {
  const response = await api.get(`/games/${gameId}/scores/me`);
  return response.data.data;
};

export const submitScore = async (gameId, score) => {
  const response = await api.post(`/games/${gameId}/scores`, { score });
  return response.data;
};
