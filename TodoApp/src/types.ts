// Shared types used across the app.

export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  scheduledAt: string; // ISO date-time: when the user plans to start
  deadline: string; // ISO date-time: when it must be done
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
}

/** Fields the user can edit in the task form. */
export interface TaskInput {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  scheduledAt: string;
  deadline: string;
}

export type StatusFilter = 'all' | 'active' | 'done' | 'overdue';
export type SortMode = 'smart' | 'deadline' | 'priority' | 'newest';

export interface Filters {
  status: StatusFilter;
  priority: Priority | 'all';
  category: string; // 'all' or a category name
  search: string;
  sort: SortMode;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tasks: undefined;
  TaskForm: { taskId?: string } | undefined;
};
