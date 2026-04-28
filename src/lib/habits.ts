import type { Habit } from "@/types/habit";

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const completions = habit.completions ?? [];

  const alreadyCompleted = completions.includes(date);

  const newCompletions = alreadyCompleted
    ? completions.filter((d) => d !== date)
    : [...completions, date];

  const deduped = [...new Set(newCompletions)];
  return { ...habit, completions: deduped };
}
