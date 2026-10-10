import { Priority } from './types';

// Single source of truth for the app's "midnight neon" look.
export const colors = {
  bg: '#0A0E1F',
  surface: '#141A33',
  surfaceAlt: '#1C2444',
  border: '#2A3358',
  text: '#F2F4FF',
  textMuted: '#8F98C2',
  accent: '#7C5CFF',
  accentAlt: '#22D3EE',
  danger: '#FF5C7A',
  success: '#3DDC97',
  warning: '#FFB84D',
};

export const priorityColor: Record<Priority, string> = {
  high: colors.danger,
  medium: colors.warning,
  low: colors.success,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };
