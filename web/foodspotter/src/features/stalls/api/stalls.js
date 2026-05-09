import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
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

export const updateStall = async (token, id, payload) => {
  const { data } = await api.put(`/stalls/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const getVendorStalls = async (token) => {
  const { data } = await api.get("/stalls/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getPendingStalls = async (token) => {
  const { data } = await api.get("/stalls/admin/pending-stalls", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const approveStall = async (token, id) => {
  const { data } = await api.put(
    `/stalls/admin/stalls/${id}/approve`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
};

export const clearStallMenu = async (token, id) => {
  const { data } = await api.put(
    `/stalls/admin/stalls/${id}/clear-menu`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
};

export const rejectStall = async (token, id) => {
  const { data } = await api.delete(`/stalls/admin/stalls/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
