export function validateEmail(email: string): {
  valid: boolean;
  error: string | null;
} {
  const trimmed = email.trim().toLowerCase();

  if (trimmed.length === 0) {
    return { valid: false, error: "Email is required" };
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  return { valid: true, error: null };
}

export function validatePassword(password: string): {
  valid: boolean;
  error: string | null;
} {
  if (password.length === 0) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }

  return { valid: true, error: null };
}

export function validateHabitName(name: string): {
  valid: boolean;
  value: string;
  error: string | null;
} {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, value: "", error: "Habit name is required" };
  }

  if (trimmed.length > 60) {
    return {
      valid: false,
      value: trimmed,
      error: "Habit name must be 60 characters or fewer",
    };
  }

  return { valid: true, value: trimmed, error: null };
}
