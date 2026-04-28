"use client";

import { useState, useEffect, useCallback } from "react";
import { Session, User } from "@/types/auth";
import {
  getSession,
  saveSession,
  clearSession,
  getUsers,
  saveUsers,
} from "@/lib/storage";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setSession(getSession());
    setLoading(false);
  }, []);

  const signup = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const users = getUsers();
      if (users.find((u) => u.email === email)) {
        return { success: false, error: "User already exists" };
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        password,
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, newUser]);
      const sess: Session = { userId: newUser.id, email };
      saveSession(sess);
      setSession(sess);
      router.push("/dashboard");
      return { success: true };
    },
    [router],
  );

  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const users = getUsers();
      const user = users.find(
        (u) => u.email === email && u.password === password,
      );
      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }
      const sess: Session = { userId: user.id, email };
      saveSession(sess);
      setSession(sess);
      router.push("/dashboard");
      return { success: true };
    },
    [router],
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    router.push("/login");
  }, [router]);

  return { session, loading, signup, login, logout };
}
