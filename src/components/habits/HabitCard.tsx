"use client";

import { useState } from "react";
import { Habit } from "@/types/habit";
import { getHabitSlug } from "@/lib/slug";
import { calculateCurrentStreak } from "@/lib/streaks";

interface HabitCardProps {
  habit: Habit;
  today: string;
  onToggleComplete: (id: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({
  habit,
  today,
  onToggleComplete,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const slug = getHabitSlug(habit.name);
  const streak = calculateCurrentStreak(habit.completions, today);
  const isCompleted = habit.completions.includes(today);

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`rounded-xl border p-4 transition-all ${
        isCompleted
          ? "bg-violet-50 border-violet-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-base truncate ${isCompleted ? "text-violet-800 line-through opacity-70" : "text-gray-900"}`}
          >
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {habit.description}
            </p>
          )}
          <div
            data-testid={`habit-streak-${slug}`}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5"
          >
            🔥 {streak} day streak
          </div>
        </div>

        <button
          data-testid={`habit-complete-${slug}`}
          onClick={() => onToggleComplete(habit.id, today)}
          aria-label={
            isCompleted
              ? `Unmark ${habit.name} as complete`
              : `Mark ${habit.name} as complete`
          }
          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
            isCompleted
              ? "bg-violet-500 border-violet-500 text-white"
              : "border-gray-300 hover:border-violet-400"
          }`}
        >
          {isCompleted && <span aria-hidden="true">✓</span>}
        </button>
      </div>

      {!confirmDelete ? (
        <div className="flex gap-2 mt-3">
          <button
            data-testid={`habit-edit-${slug}`}
            onClick={() => onEdit(habit)}
            className="text-xs text-gray-500 hover:text-violet-600 border border-gray-200 rounded-md px-3 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            Edit
          </button>
          <button
            data-testid={`habit-delete-${slug}`}
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded-md px-3 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Delete
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-red-600 text-xs">Delete this habit?</span>
          <button
            data-testid="confirm-delete-button"
            onClick={() => onDelete(habit.id)}
            className="text-xs bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Yes, delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
