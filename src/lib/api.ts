const configuredUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_URL = configuredUrl && !/^https?:\/\//.test(configuredUrl) ? `https://${configuredUrl}` : configuredUrl;

export function apiUrl(path: string) {
  return `${API_URL}${path}`;
}
