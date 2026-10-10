import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice';
import tasksReducer from './tasksSlice';

// Two slices: `auth` (session) and `tasks` (data + UI filters).
export const store = configureStore({
  reducer: { auth: authReducer, tasks: tasksReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks so components don't have to repeat the generics.
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
