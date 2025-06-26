import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import CalendarPage from "../src/components/CalendarPage";

beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ events: [] }),
  });
});

afterEach(() => {
  vi.restoreAllMocks(); // 🧼 Clean up
});

describe("CalendarPage", () => {
  it("renders the calendar header and instruction", async () => {
    render(
      <BrowserRouter>
        <CalendarPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Event Calendar")).toBeInTheDocument();
      expect(
        screen.getByText("Select a date to view events.")
      ).toBeInTheDocument();
    });
  });

  it("displays loading and then 'No event for this date'", async () => {
    render(
      <BrowserRouter>
        <CalendarPage />
      </BrowserRouter>
    );

    const calendarButtons = await screen.findAllByRole("button");

    // Prefer to assert the number or presence of calendar tiles
    const dayButton = calendarButtons.find((btn) =>
      btn.className.includes("react-calendar__tile")
    );

    expect(dayButton).toBeDefined();
    if (dayButton) {
      await userEvent.click(dayButton);
    }

    await waitFor(() => {
      expect(screen.getByText("No event for this date.")).toBeInTheDocument();
    });
  });
});
