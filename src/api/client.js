import Constants from 'expo-constants';

// ---------------------------------------------------------------------------
// BASE_URL: the ONLY place the server address is written.
//
// On a phone, "localhost" means the phone itself, so the app must use the
// laptop's Wi-Fi IP address. Expo already knows that IP (it is the address
// in the QR code), so we read it from there automatically.
//
// If it ever does not work, type your laptop's IP here instead, e.g.
//   const MANUAL_BASE_URL = 'http://192.168.1.15:5000/api';
// (Android emulator: 'http://10.0.2.2:5000/api')
// ---------------------------------------------------------------------------
const MANUAL_BASE_URL = '';

const SERVER_PORT = 5000;
const expoHost = Constants.expoConfig?.hostUri?.split(':')[0]; // e.g. "192.168.1.15"
export const BASE_URL = MANUAL_BASE_URL || `http://${expoHost || 'localhost'}:${SERVER_PORT}/api`;

// The JWT token of the logged-in user. AuthContext sets it after login.
let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

// Sends a request to the server and returns the JSON answer.
//   api('/menu')
//   api('/orders', { method: 'POST', body: { ... } })
// Adds the JSON header and the token, and throws an Error with the
// server's own message when the request fails.
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    // fetch only throws when the server could not be reached at all.
    throw new Error(
      `Cannot reach the server at ${BASE_URL}. Is it running (npm run dev) and are the phone and laptop on the same Wi-Fi?`
    );
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error((data && data.message) || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export default api;
