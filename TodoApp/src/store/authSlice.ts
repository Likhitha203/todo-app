import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getErrorMessage, setAuthToken } from '../api/client';
import { User } from '../types';

const STORAGE_KEY = 'todo_auth_token';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean; // true while a login / register request is running
  initializing: boolean; // true until we've tried to restore a saved session
  error: string | null;
}

const initialState: AuthState = { user: null, token: null, loading: false, initializing: true, error: null };

interface AuthResponse {
  token: string;
  user: User;
}

/** Saves the token on the device and on the axios instance. */
async function persist(token: string) {
  setAuthToken(token);
  await AsyncStorage.setItem(STORAGE_KEY, token);
}

export const register = createAsyncThunk<AuthResponse, { name: string; email: string; password: string }, { rejectValue: string }>(
  'auth/register',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', body);
      await persist(data.token);
      return data;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  },
);

export const login = createAsyncThunk<AuthResponse, { email: string; password: string }, { rejectValue: string }>(
  'auth/login',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', body);
      await persist(data.token);
      return data;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  },
);

/** On app start: if a token was saved, verify it with the server and sign straight in. */
export const restoreSession = createAsyncThunk<AuthResponse | null>('auth/restore', async () => {
  const token = await AsyncStorage.getItem(STORAGE_KEY);
  if (!token) return null;
  setAuthToken(token);
  try {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return { token, user: data.user };
  } catch {
    setAuthToken(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  setAuthToken(null);
  await AsyncStorage.removeItem(STORAGE_KEY);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    const pending = (state: AuthState) => {
      state.loading = true;
      state.error = null;
    };
    const fulfilled = (state: AuthState, action: { payload: AuthResponse }) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    };
    const rejected = (state: AuthState, action: { payload?: string }) => {
      state.loading = false;
      state.error = action.payload ?? 'Something went wrong';
    };
    builder
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected)
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.initializing = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(restoreSession.rejected, state => {
        state.initializing = false;
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
