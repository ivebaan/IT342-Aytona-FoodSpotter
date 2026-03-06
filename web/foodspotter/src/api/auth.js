import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

export const register = async ({ firstname, lastname, email, password }) => {
  const { data } = await api.post('/auth/register', {
    firstname,
    lastname,
    email,
    password,
  });
  return data;
};

export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};
