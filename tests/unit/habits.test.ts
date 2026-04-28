import { describe, it, expect } from "vitest";
import { toggleHabitCompletion } from "@/lib/habits";
import { Habit } from "@/types/habit";

const baseHabit: Habit = {
  id: "habit-1",
  userId: "user-1",
  name: "Drink Water",
  description: "",
  frequency: "daily",
  createdAt: "2025-01-01T00:00:00.000Z",
  completions: ["2025-01-08", "2025-01-09"],
};

describe("toggleHabitCompletion", () => {
  it("adds a completion date when the date is not present", () => {
    const result = toggleHabitCompletion(baseHabit, "2025-01-10");
    expect(result.completions).toContain("2025-01-10");
    expect(result.completions).toHaveLength(3);
  });

  it("removes a completion date when the date already exists", () => {
    const result = toggleHabitCompletion(baseHabit, "2025-01-09");
    expect(result.completions).not.toContain("2025-01-09");
    expect(result.completions).toHaveLength(1);
  });

  it("does not mutate the original habit object", () => {
    const original = { ...baseHabit, completions: [...baseHabit.completions] };
    toggleHabitCompletion(baseHabit, "2025-01-10");
    expect(baseHabit.completions).toEqual(original.completions);
  });

  it("does not return duplicate completion dates", () => {
    const habitWithDuplicate: Habit = {
      ...baseHabit,
      completions: ["2025-01-09", "2025-01-09"],
    };
    const result = toggleHabitCompletion(habitWithDuplicate, "2025-01-10");
    const unique = Array.from(new Set(result.completions));
    expect(result.completions).toHaveLength(unique.length);
  });
});
