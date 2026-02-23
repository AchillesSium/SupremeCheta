const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const TOKEN_CONFIG = {
  PROACTIVE_REFRESH_SECONDS: parseInt(process.env.REACT_APP_TOKEN_PROACTIVE_REFRESH_SECONDS) || 60,
};

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  FINGERPRINT: 'device_fingerprint',
};

export { API_URL, TOKEN_CONFIG, STORAGE_KEYS };
