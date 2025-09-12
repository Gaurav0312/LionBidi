// src/utils/apiFetch.js

export const getBaseUrl = () => {
  // If you defined REACT_APP_API_URL in .env, prefer that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Otherwise, use the frontend's current origin (works for localhost, LAN IP, Vercel)
  return window.location.origin;
};

export const apiFetch = async (endpoint, options = {}) => {
  const BASE_URL = getBaseUrl();

  // Merge defaults with provided options
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(options.token && { Authorization: `Bearer ${options.token}` }),
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, finalOptions);

  // Handle errors gracefully
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API request failed");
  }

  return response.json();
};
