import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://it342-aytona-foodspotter.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

export const register = async ({ firstname, lastname, email, password }) => {
  const { data } = await api.post('/auth/register', {
    firstname,
    lastname,
    email,
    password,
  });
  return data?.data;
};

export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data?.data;
};

export const getCurrentUser = async (token) => {
  const { data } = await api.get('/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data?.data;
};
