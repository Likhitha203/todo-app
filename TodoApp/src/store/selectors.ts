import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { sortTasks } from '../utils/smartSort';

const selectItems = (s: RootState) => s.tasks.items;
export const selectFilters = (s: RootState) => s.tasks.filters;

/** Unique category names, for the category filter chips. */
export const selectCategories = createSelector(selectItems, items =>
  Array.from(new Set(items.map(t => t.category))).sort(),
);

/** Tasks after applying search + status/priority/category filters and the chosen sort. */
export const selectVisibleTasks = createSelector([selectItems, selectFilters], (items, f) => {
  const now = Date.now();
  const q = f.search.trim().toLowerCase();
  const filtered = items.filter(t => {
    if (f.priority !== 'all' && t.priority !== f.priority) return false;
    if (f.category !== 'all' && t.category !== f.category) return false;
    if (f.status === 'active' && t.completed) return false;
    if (f.status === 'done' && !t.completed) return false;
    if (f.status === 'overdue' && (t.completed || new Date(t.deadline).getTime() >= now)) return false;
    if (q && !`${t.title} ${t.description} ${t.category}`.toLowerCase().includes(q)) return false;
    return true;
  });
  return sortTasks(filtered, f.sort, now);
});

/** Numbers for the progress card at the top of the list. */
export const selectStats = createSelector(selectItems, items => {
  const now = Date.now();
  const done = items.filter(t => t.completed).length;
  const overdue = items.filter(t => !t.completed && new Date(t.deadline).getTime() < now).length;
  return { total: items.length, done, overdue, active: items.length - done };
});
