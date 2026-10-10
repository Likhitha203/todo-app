import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Where the backend lives.
 *  - Android emulator: 10.0.2.2 is the alias for the host machine's localhost.
 *  - Physical phone over USB: run `adb reverse tcp:5000 tcp:5000` and use localhost,
 *    or replace this with your computer's LAN IP (e.g. http://192.168.1.10:5000/api).
 */
export const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

let unauthorizedHandler: (() => void) | null = null;

/** Registered once in App.tsx so an expired token logs the user out automatically. */
export function setUnauthorizedHandler(fn: () => void) {
  unauthorizedHandler = fn;
}

/** Attach (or clear) the JWT sent with every request. */
export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401 && api.defaults.headers.common.Authorization) {
      unauthorizedHandler?.();
    }
    return Promise.reject(err);
  },
);

/** Turns any thrown error into a readable message for the UI. */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.data?.message) return err.response.data.message as string;
    if (err.code === 'ECONNABORTED' || !err.response) {
      return 'Cannot reach the server. Is the backend running?';
    }
  }
  return 'Something went wrong. Please try again.';
}
