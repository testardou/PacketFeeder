/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_CONFIG = {
  BASE_URL: API_URL,
  API_BASE: `${API_URL}/api`,
  SOCKET_URL: `${API_URL}/realtime`,
} as const;
