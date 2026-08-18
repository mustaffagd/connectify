import api from "./api";

export const sendMessage = async (conversationId, content) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, {
    content,
  });
  return response.data;
};

export const getMessages = async (conversationId, page = 1) => {
  const response = await api.get(`/conversations/${conversationId}/messages`, {
    params: { page },
  });
  return response.data;
};

export const markAsRead = async (conversationId) => {
  const response = await api.put(`/conversations/${conversationId}/read`);
  return response.data;
};
