import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important for CSRF cookies
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
  logout: () => api.post("/logout"),
  me: () => api.get("/me"),
};

// Vehicle API
export const vehicleAPI = {
  getAll: () => api.get("/vehicles"),
  getAvailable: () => api.get("/vehicles/available"),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Booking API
export const bookingAPI = {
  getAll: () => api.get("/bookings"),
  getMine: () => api.get("/bookings/mine"),
  getOne: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post("/bookings", data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  approve: (id) => api.post(`/bookings/${id}/approve`),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
};

// Rental API
export const rentalAPI = {
  getAll: () => api.get("/rentals"),
  getOne: (id) => api.get(`/rentals/${id}`),
  checkout: (id, data) => api.post(`/bookings/${id}/checkout`, data),
  returnVehicle: (id, data) => api.post(`/rentals/${id}/return`, data),
};

// Dashboard API
export const dashboardAPI = {
  get: () => api.get("/dashboard"),
};

export default api;
