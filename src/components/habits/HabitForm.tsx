"use client";

import { useState, FormEvent, useEffect } from "react";
import { Habit } from "@/types/habit";
import { validateHabitName } from "@/lib/validators";

interface HabitFormProps {
  initial?: Habit;
  onSave: (data: {
    name: string;
    description: string;
    frequency: "daily";
  }) => void;
  onCancel: () => void;
}

export default function HabitForm({
  initial,
  onSave,
  onCancel,
}: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
  }, [initial]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateHabitName(name);
    if (!validation.valid) {
      setNameError(validation.error!);
      return;
    }
    setNameError("");
    onSave({
      name: validation.value,
      description: description.trim(),
      frequency: "daily",
    });
  };

  return (
    <form
      data-testid="habit-form"
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >
      <div>
        <label
          htmlFor="habit-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Habit name{" "}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <input
          id="habit-name"
          data-testid="habit-name-input"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError("");
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="e.g. Drink Water"
          maxLength={61}
        />
        {nameError && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {nameError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="habit-description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <input
          id="habit-description"
          data-testid="habit-description-input"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="Optional details"
        />
      </div>

      <div>
        <label
          htmlFor="habit-frequency"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Frequency
        </label>
        <select
          id="habit-frequency"
          data-testid="habit-frequency-select"
          defaultValue="daily"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        >
          <option value="daily">Daily</option>
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          data-testid="habit-save-button"
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          {initial ? "Save changes" : "Create habit"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
