import api from "./api";

export const settingsAPI = {
  getSettings: () => api.get(`/settings`),
  uploadHeroImage: (formData, config = {}) =>
    api.post(`/settings/hero-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),
  setHeroExternal: (url) =>
    api.post(`/settings/hero-image`, { external_url: url }),
  deleteHeroImage: () => api.delete(`/settings/hero-image`),
};
