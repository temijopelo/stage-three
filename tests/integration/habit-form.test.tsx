import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Habit } from "@/types/habit";
import HabitList from "@/components/habits/HabitList";
import { toggleHabitCompletion } from "@/lib/habits";

const TODAY = "2025-06-01";

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "habit-1",
    userId: "user-1",
    name: "Drink Water",
    description: "",
    frequency: "daily",
    createdAt: "2025-01-01T00:00:00.000Z",
    completions: [],
    ...overrides,
  };
}

function renderList(
  habits: Habit[],
  handlers: Partial<{
    onAdd: (d: {
      name: string;
      description: string;
      frequency: "daily";
    }) => void;
    onUpdate: (
      h: Habit,
      d: { name: string; description: string; frequency: "daily" },
    ) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string, date: string) => void;
  }> = {},
) {
  const onAdd = handlers.onAdd ?? vi.fn();
  const onUpdate = handlers.onUpdate ?? vi.fn();
  const onDelete = handlers.onDelete ?? vi.fn();
  const onToggle = handlers.onToggle ?? vi.fn();

  return render(
    <HabitList
      habits={habits}
      today={TODAY}
      userId="user-1"
      onAdd={onAdd}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onToggle={onToggle}
    />,
  );
}

describe("habit form", () => {
  it("shows a validation error when habit name is empty", async () => {
    const user = userEvent.setup();
    renderList([]);

    await user.click(screen.getByTestId("create-habit-button"));
    await waitFor(() => screen.getByTestId("habit-form"));

    await user.click(screen.getByTestId("habit-save-button"));

    await waitFor(() => {
      expect(screen.getByText("Habit name is required")).toBeInTheDocument();
    });
  });

  it("creates a new habit and renders it in the list", async () => {
    const user = userEvent.setup();
    let habits: Habit[] = [];

    const { rerender } = renderList(habits, {
      onAdd: (data) => {
        habits = [
          ...habits,
          makeHabit({ name: data.name, description: data.description }),
        ];
        rerender(
          <HabitList
            habits={habits}
            today={TODAY}
            userId="user-1"
            onAdd={vi.fn()}
            onUpdate={vi.fn()}
            onDelete={vi.fn()}
            onToggle={vi.fn()}
          />,
        );
      },
    });

    await user.click(screen.getByTestId("create-habit-button"));
    await waitFor(() => screen.getByTestId("habit-form"));

    await user.type(screen.getByTestId("habit-name-input"), "Drink Water");
    await user.type(screen.getByTestId("habit-description-input"), "8 glasses");
    await user.click(screen.getByTestId("habit-save-button"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-card-drink-water")).toBeInTheDocument();
    });
  });

  it("edits an existing habit and preserves immutable fields", async () => {
    const user = userEvent.setup();
    const original = makeHabit({
      id: "habit-abc",
      name: "Read Books",
      createdAt: "2025-01-01T00:00:00.000Z",
      completions: ["2025-01-05"],
    });
    let habits: Habit[] = [original];

    let updatedHabit: Habit | null = null;
    const { rerender } = renderList(habits, {
      onUpdate: (habit, data) => {
        updatedHabit = {
          ...habit,
          name: data.name,
          description: data.description,
        };
        habits = [updatedHabit];
        rerender(
          <HabitList
            habits={habits}
            today={TODAY}
            userId="user-1"
            onAdd={vi.fn()}
            onUpdate={vi.fn()}
            onDelete={vi.fn()}
            onToggle={vi.fn()}
          />,
        );
      },
    });

    await user.click(screen.getByTestId("habit-edit-read-books"));
    await waitFor(() => screen.getByTestId("habit-form"));

    const nameInput = screen.getByTestId("habit-name-input");
    await user.clear(nameInput);
    await user.type(nameInput, "Read More Books");
    await user.click(screen.getByTestId("habit-save-button"));

    await waitFor(() => {
      expect(
        screen.getByTestId("habit-card-read-more-books"),
      ).toBeInTheDocument();
    });

    // Immutable fields preserved
    expect(updatedHabit!.id).toBe("habit-abc");
    expect(updatedHabit!.userId).toBe("user-1");
    expect(updatedHabit!.createdAt).toBe("2025-01-01T00:00:00.000Z");
    expect(updatedHabit!.completions).toEqual(["2025-01-05"]);
  });

  it("deletes a habit only after explicit confirmation", async () => {
    const user = userEvent.setup();
    let habits: Habit[] = [makeHabit({ name: "Morning Run" })];

    const { rerender } = renderList(habits, {
      onDelete: (id) => {
        habits = habits.filter((h) => h.id !== id);
        rerender(
          <HabitList
            habits={habits}
            today={TODAY}
            userId="user-1"
            onAdd={vi.fn()}
            onUpdate={vi.fn()}
            onDelete={vi.fn()}
            onToggle={vi.fn()}
          />,
        );
      },
    });

    await waitFor(() => screen.getByTestId("habit-card-morning-run"));

    // First click shows confirmation, does not delete
    await user.click(screen.getByTestId("habit-delete-morning-run"));
    expect(screen.queryByTestId("habit-card-morning-run")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-delete-button")).toBeInTheDocument();

    // Confirm deletion
    await user.click(screen.getByTestId("confirm-delete-button"));

    await waitFor(() => {
      expect(
        screen.queryByTestId("habit-card-morning-run"),
      ).not.toBeInTheDocument();
    });
  });

  it("toggles completion and updates the streak display", async () => {
    const user = userEvent.setup();

    // Use a wrapper component so state is properly managed across rerenders
    function HabitListWrapper() {
      const [habits, setHabits] = useState<Habit[]>([
        makeHabit({ name: "Meditate" }),
      ]);

      const handleToggle = (id: string, date: string) => {
        setHabits((prev) =>
          prev.map((h) => (h.id === id ? toggleHabitCompletion(h, date) : h)),
        );
      };

      return (
        <HabitList
          habits={habits}
          today={TODAY}
          userId="user-1"
          onAdd={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
          onToggle={handleToggle}
        />
      );
    }

    render(<HabitListWrapper />);
    await waitFor(() => screen.getByTestId("habit-card-meditate"));

    // Streak starts at 0
    expect(screen.getByTestId("habit-streak-meditate").textContent).toContain(
      "0",
    );

    // Toggle complete for TODAY
    await user.click(screen.getByTestId("habit-complete-meditate"));
    await waitFor(() => {
      expect(screen.getByTestId("habit-streak-meditate").textContent).toContain(
        "1",
      );
    });

    // Toggle again — unmark
    await user.click(screen.getByTestId("habit-complete-meditate"));
    await waitFor(() => {
      expect(screen.getByTestId("habit-streak-meditate").textContent).toContain(
        "0",
      );
    });
  });
});
