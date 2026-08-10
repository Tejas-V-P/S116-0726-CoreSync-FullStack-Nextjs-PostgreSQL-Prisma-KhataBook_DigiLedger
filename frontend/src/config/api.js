// Centralized API Base URL configuration for KhataBook DigiLedger Frontend
// Uses VITE_API_BASE_URL environment variable in production, fallback to local backend port 5000 in development

const getApiBase = () => {
  let rawUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').trim();
  rawUrl = rawUrl.replace(/\/+$/, '');
  if (!rawUrl.endsWith('/api')) {
    rawUrl = `${rawUrl}/api`;
  }
  return rawUrl;
};

export const API_BASE = getApiBase();
