// Centralized API Base URL configuration for KhataBook DigiLedger Frontend
// Uses VITE_API_BASE_URL environment variable in production, fallback to local backend port 5000 in development

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
