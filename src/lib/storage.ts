import { User, Session } from "@/types/auth";
import { Habit } from "@/types/habit";

const KEYS = {
  USERS: "habit-tracker-users",
  SESSION: "habit-tracker-session",
  HABITS: "habit-tracker-habits",
} as const;

// ─── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.USERS) ?? "[]");
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}
export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null): void {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(null));
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export function getHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.HABITS) ?? "[]");
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
}

export function getHabitsByUser(userId: string): Habit[] {
  return getHabits().filter((h) => h.userId === userId);
}
