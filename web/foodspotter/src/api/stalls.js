import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

export const getStalls = async (token) => {
  const { data } = await api.get("/stalls", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const createStall = async (
  token,
  { name, description, cuisine, latitude, longitude },
) => {
  const { data } = await api.post(
    "/stalls",
    {
      name,
      description,
      cuisine,
      latitude: String(latitude),
      longitude: String(longitude),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};
