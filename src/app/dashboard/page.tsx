"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation.js";
import { getSession, clearSession } from "@/lib/storage";
import { useHabits } from "@/hooks/useHabits";
import HabitList from "@/components/habits/HabitList";
import { Habit } from "@/types/habit";
import { Session } from "@/types/auth";
import { generateId } from "@/lib/auth";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
    } else {
      setSession(s);
      setReady(true);
    }
  }, [router]);

  const { habits, createHabit, editHabit, deleteHabit, toggleCompletion } =
    useHabits(session?.userId);

  const today = todayISO();

  const handleAdd = (data: {
    name: string;
    description: string;
    frequency: "daily";
  }) => {
    createHabit({
      name: data.name,
      description: data.description,
      frequency: data.frequency,
    });
    console.log(habits, "kkk");
    return {
      id: generateId(),
      userId: session!.userId,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      createdAt: new Date().toISOString(),
      completions: [],
    } as Habit;
  };

  const handleUpdate = (
    habit: Habit,
    data: { name: string; description: string; frequency: "daily" },
  ) => {
    editHabit(habit.id, {
      name: data.name,
      description: data.description,
      frequency: data.frequency,
    });
  };

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  if (!ready) return null;

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">Yami Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:block">
            {session?.email}
          </span>
          <button
            data-testid="auth-logout-button"
            onClick={handleLogout}
            className="text-sm text-red-600 font-medium hover:underline focus:outline-none focus:underline"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        <HabitList
          habits={habits}
          today={today}
          userId={session!.userId}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={deleteHabit}
          onToggle={toggleCompletion}
        />
      </main>
    </div>
  );
}
