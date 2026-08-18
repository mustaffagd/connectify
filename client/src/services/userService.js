import api from "./api";

export const searchUsers = async (query) => {
  const response = await api.get(`/users/search`, { params: { q: query } });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateProfile = async ({ username, bio, profile_image }) => {
  const response = await api.put("/users/profile", {
    username,
    bio,
    profile_image,
  });
  return response.data;
};
