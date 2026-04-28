export function calculateCurrentStreak(
  completions: string[],
  today?: string,
): number {
  const todayStr = today ?? new Date().toISOString().slice(0, 10);

  const unique = [...new Set(completions)];

  if (!unique.includes(todayStr)) return 0;
  unique.sort();

  let streak = 0;
  let cursor = new Date(todayStr);

  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (!unique.includes(dateStr)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
