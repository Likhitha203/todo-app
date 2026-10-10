import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api, getErrorMessage } from '../api/client';
import { Filters, Task, TaskInput } from '../types';
import { logout } from './authSlice';

interface TasksState {
  items: Task[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  filters: Filters;
}

export const defaultFilters: Filters = { status: 'all', priority: 'all', category: 'all', search: '', sort: 'smart' };

const initialState: TasksState = { items: [], loading: false, saving: false, error: null, filters: defaultFilters };

type ThunkCfg = { rejectValue: string };

export const fetchTasks = createAsyncThunk<Task[], void, ThunkCfg>('tasks/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{ tasks: Task[] }>('/tasks');
    return data.tasks;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const addTask = createAsyncThunk<Task, TaskInput, ThunkCfg>('tasks/add', async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post<{ task: Task }>('/tasks', body);
    return data.task;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const updateTask = createAsyncThunk<Task, { id: string; changes: TaskInput }, ThunkCfg>(
  'tasks/update',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<{ task: Task }>(`/tasks/${id}`, changes);
      return data.task;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  },
);

export const toggleTask = createAsyncThunk<Task, string, ThunkCfg>('tasks/toggle', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<{ task: Task }>(`/tasks/${id}/toggle`);
    return data.task;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const deleteTask = createAsyncThunk<string, string, ThunkCfg>('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${id}`);
    return id;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<Filters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTasksError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Could not load tasks';
      })
      .addCase(addTask.pending, state => {
        state.saving = true;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(addTask.rejected, state => {
        state.saving = false;
      })
      .addCase(updateTask.pending, state => {
        state.saving = true;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.saving = false;
        const i = state.items.findIndex(t => t._id === action.payload._id);
        if (i >= 0) state.items[i] = action.payload;
      })
      .addCase(updateTask.rejected, state => {
        state.saving = false;
      })
      .addCase(toggleTask.fulfilled, (state, action) => {
        const i = state.items.findIndex(t => t._id === action.payload._id);
        if (i >= 0) state.items[i] = action.payload;
      })
      .addCase(toggleTask.rejected, (state, action) => {
        state.error = action.payload ?? 'Could not update task';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload ?? 'Could not delete task';
      })
      // Wipe all task data when the user logs out so the next user never sees it.
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const { setFilters, clearTasksError } = tasksSlice.actions;
export default tasksSlice.reducer;
