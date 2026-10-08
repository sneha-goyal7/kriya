export function calculateProgress(completed = 0, total = 0) {
  if (!total) return 0;

  return Math.round((completed / total) * 100);
}
