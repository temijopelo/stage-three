import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockPush }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

import SignupForm from "@/components/auth/SignupForm";
import LoginForm from "@/components/auth/LoginForm";
import { getSession, getUsers } from "@/lib/storage";

beforeEach(() => {
  localStorage.clear();
  mockPush.mockClear();
});

describe("auth flow", () => {
  it("submits the signup form and creates a session", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(
      screen.getByTestId("auth-signup-email"),
      "alice@example.com",
    );
    await user.type(screen.getByTestId("auth-signup-password"), "password123");
    await user.click(screen.getByTestId("auth-signup-submit"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe("alice@example.com");

    const users = getUsers();
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe("alice@example.com");
  });

  it("shows an error for duplicate signup email", async () => {
    const user = userEvent.setup();

    // First signup
    render(<SignupForm />);
    await user.type(
      screen.getByTestId("auth-signup-email"),
      "alice@example.com",
    );
    await user.type(screen.getByTestId("auth-signup-password"), "password123");
    await user.click(screen.getByTestId("auth-signup-submit"));

    localStorage.setItem("habit-tracker-session", "null");

    // Second signup with same email
    render(<SignupForm />);
    const emailInputs = screen.getAllByTestId("auth-signup-email");
    const passwordInputs = screen.getAllByTestId("auth-signup-password");
    const submitButtons = screen.getAllByTestId("auth-signup-submit");

    await user.type(emailInputs[emailInputs.length - 1], "alice@example.com");
    await user.type(passwordInputs[passwordInputs.length - 1], "different");
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getAllByText("User already exists").length).toBeGreaterThan(
        0,
      );
    });
  });

  it("submits the login form and stores the active session", async () => {
    const user = userEvent.setup();

    // Seed a user
    localStorage.setItem(
      "habit-tracker-users",
      JSON.stringify([
        {
          id: "user-1",
          email: "bob@example.com",
          password: "secret",
          createdAt: new Date().toISOString(),
        },
      ]),
    );

    render(<LoginForm />);
    await user.type(screen.getByTestId("auth-login-email"), "bob@example.com");
    await user.type(screen.getByTestId("auth-login-password"), "secret");
    await user.click(screen.getByTestId("auth-login-submit"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    const session = getSession();
    expect(session?.userId).toBe("user-1");
    expect(session?.email).toBe("bob@example.com");
  });

  it("shows an error for invalid login credentials", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);
    await user.type(
      screen.getByTestId("auth-login-email"),
      "nobody@example.com",
    );
    await user.type(screen.getByTestId("auth-login-password"), "wrongpassword");
    await user.click(screen.getByTestId("auth-login-submit"));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });
});
