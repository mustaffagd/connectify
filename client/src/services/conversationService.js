import api from "./api";

export const createConversation = async (userId) => {
  const response = await api.post("/conversations", { userId });
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get("/conversations");
  return response.data;
};

export const getConversationById = async (id) => {
  const response = await api.get(`/conversations/${id}`);
  return response.data;
};
