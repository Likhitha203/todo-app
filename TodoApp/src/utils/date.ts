const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** e.g. "12 Oct, 4:30 PM" (manual formatting so it behaves the same on every device). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${h}:${m} ${ampm}`;
}

/** Human friendly distance to a deadline: "Due in 3h", "Overdue by 2d" ... */
export function describeDeadline(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  const span = mins < 60 ? `${Math.max(mins, 1)}m` : hours < 48 ? `${hours}h` : `${days}d`;
  return diff < 0 ? `Overdue by ${span}` : `Due in ${span}`;
}
