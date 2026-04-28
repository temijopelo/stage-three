"use client";
import { useState } from "react";
import { Habit } from "@/types/habit";
import HabitCard from "./HabitCard";
import HabitForm from "./HabitForm";
import Modal from "@/components/shared/Modal";

interface Props {
  habits: Habit[];
  today: string;
  userId: string;
  onAdd: (data: {
    name: string;
    description: string;
    frequency: "daily";
  }) => void;
  onUpdate: (
    habit: Habit,
    data: { name: string; description: string; frequency: "daily" },
  ) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, date: string) => void;
}

export default function HabitList({
  habits,
  today,
  onAdd,
  onUpdate,
  onDelete,
  onToggle,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">My Habits</h2>
        {!showForm && !editingHabit && (
          <button
            data-testid="create-habit-button"
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
          >
            + New habit
          </button>
        )}
      </div>

      {/* Create Habit Modal */}
      <Modal
        isOpen={showForm}
        title="Create new habit"
        onClose={() => setShowForm(false)}
      >
        <HabitForm
          onSave={(data) => {
            onAdd(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit Habit Modal */}
      <Modal
        isOpen={!!editingHabit}
        title="Edit habit"
        onClose={() => setEditingHabit(null)}
      >
        {editingHabit && (
          <HabitForm
            initial={editingHabit}
            onSave={(data) => {
              onUpdate(editingHabit, data);
              setEditingHabit(null);
            }}
            onCancel={() => setEditingHabit(null)}
          />
        )}
      </Modal>

      {habits.length === 0 && !showForm ? (
        <div
          data-testid="empty-state"
          className="text-center py-16 text-gray-400"
        >
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium">No habits yet</p>
          <p className="text-sm mt-1">
            Click &quot;+ New habit&quot; to get started
          </p>
        </div>
      ) : (
        <ul className=" flex flex-col gap-4">
          {habits.map((habit) => (
            <li key={habit.id}>
              <HabitCard
                habit={habit}
                today={today}
                onToggleComplete={onToggle}
                onEdit={setEditingHabit}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
