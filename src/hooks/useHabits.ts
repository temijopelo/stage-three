"use client";

import { useState, useEffect, useCallback } from "react";
import { Habit } from "@/types/habit";
import { getHabits, saveHabits } from "@/lib/storage";
import { toggleHabitCompletion } from "@/lib/habits";

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!userId) return;
    const all = getHabits();
    setHabits(all.filter((h) => h.userId === userId));
  }, [userId]);

  const persist = useCallback(
    (updated: Habit[]) => {
      const all = getHabits().filter((h) => h.userId !== userId);
      saveHabits([...all, ...updated]);
      setHabits(updated);
    },
    [userId],
  );

  const createHabit = useCallback(
    (data: { name: string; description: string; frequency: "daily" }) => {
      if (!userId) return;
      const habit: Habit = {
        id: crypto.randomUUID(),
        userId,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        createdAt: new Date().toISOString(),
        completions: [],
      };
      persist([...habits, habit]);
    },
    [habits, userId, persist],
  );

  const editHabit = useCallback(
    (
      id: string,
      data: { name: string; description: string; frequency: "daily" },
    ) => {
      persist(
        habits.map((h) =>
          h.id === id
            ? {
                ...h,
                name: data.name,
                description: data.description,
                frequency: data.frequency,
              }
            : h,
        ),
      );
    },
    [habits, persist],
  );

  const deleteHabit = useCallback(
    (id: string) => {
      persist(habits.filter((h) => h.id !== id));
    },
    [habits, persist],
  );

  const toggleCompletion = useCallback(
    (id: string, date: string) => {
      persist(
        habits.map((h) => (h.id === id ? toggleHabitCompletion(h, date) : h)),
      );
    },
    [habits, persist],
  );

  return { habits, createHabit, editHabit, deleteHabit, toggleCompletion };
}
