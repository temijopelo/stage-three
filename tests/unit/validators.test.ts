import { describe, it, expect } from "vitest";
import { validateHabitName, validateEmail, validatePassword } from "@/lib/validators";

describe("validateEmail", () => {
  it("returns an error when email is empty", () => {
    expect(validateEmail("").error).toBe("Email is required");
    expect(validateEmail("   ").error).toBe("Email is required");
    expect(validateEmail("").valid).toBe(false);
  });

  it("returns an error when email format is invalid", () => {
    expect(validateEmail("invalid").valid).toBe(false);
    expect(validateEmail("invalid@").valid).toBe(false);
    expect(validateEmail("invalid@domain").valid).toBe(false);
  });

  it("returns valid for correct email format", () => {
    const result = validateEmail("user@example.com");
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("normalizes email to lowercase", () => {
    const result = validateEmail("  USER@EXAMPLE.COM  ");
    expect(result.valid).toBe(true);
  });
});

describe("validatePassword", () => {
  it("returns an error when password is empty", () => {
    expect(validatePassword("").error).toBe("Password is required");
    expect(validatePassword("").valid).toBe(false);
  });

  it("returns an error when password is less than 6 characters", () => {
    expect(validatePassword("pass").valid).toBe(false);
    expect(validatePassword("pass").error).toBe(
      "Password must be at least 6 characters",
    );
    expect(validatePassword("12345").valid).toBe(false);
  });

  it("returns valid for password with 6 or more characters", () => {
    expect(validatePassword("123456").valid).toBe(true);
    expect(validatePassword("mypassword").valid).toBe(true);
    expect(validatePassword("123456").error).toBeNull();
  });
});

describe("validateHabitName", () => {
  it("returns an error when habit name is empty", () => {
    expect(validateHabitName("").error).toBe("Habit name is required");
    expect(validateHabitName("   ").error).toBe("Habit name is required");
    expect(validateHabitName("").valid).toBe(false);
  });

  it("returns an error when habit name exceeds 60 characters", () => {
    const longName = "a".repeat(61);
    const result = validateHabitName(longName);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Habit name must be 60 characters or fewer");
  });

  it("returns a trimmed value when habit name is valid", () => {
    const result = validateHabitName("  Drink Water  ");
    expect(result.valid).toBe(true);
    expect(result.value).toBe("Drink Water");
    expect(result.error).toBeNull();
  });
});
