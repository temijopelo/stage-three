"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUsers, saveSession, saveUsers } from "@/lib/storage";
import { generateId } from "@/lib/auth";
import { validateEmail, validatePassword } from "@/lib/validators";

export default function SignupForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();

    if (users.find((u) => u.email === normalizedEmail)) {
      setError("User already exists");
      return;
    }

    const newUser = {
      id: generateId(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    saveSession({ userId: newUser.id, email: newUser.email });
    router.push("/dashboard");
  };
  return (
    <div className=" max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="signup-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="signup-email"
            data-testid="auth-signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
            }}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
              emailError ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="you@example.com"
          />
          {emailError && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="signup-password"
            data-testid="auth-signup-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(null);
            }}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
              passwordError ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Create a password"
          />
          {passwordError && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {passwordError}
            </p>
          )}
        </div>

        <button
          type="submit"
          data-testid="auth-signup-submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          Create account
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-violet-600 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
