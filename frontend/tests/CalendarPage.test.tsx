import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import CalendarPage from "../src/components/CalendarPage";

beforeEach(() => {
  globalThis.fetch = vi.fn().mockImplementation((url: RequestInfo) => {
    const urlStr = typeof url === "string" ? url : url.url;

    // Fetching all events (for highlighted dates)
    if (urlStr.includes("/events?limit=1000")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            events: [
              {
                id: "1",
                title: "Open Mic Night",
                date: "2025-06-22",
              },
            ],
          }),
      });
    }

    // Fetching events for selected date
    if (urlStr.includes("/events?date=2025-06-22")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            events: [
              {
                id: "1",
                title: "Open Mic Night",
                date: "2025-06-22",
              },
            ],
          }),
      });
    }

    // Fallback: no events
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          events: [],
        }),
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
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

  it("highlights dates with events", async () => {
    render(
      <BrowserRouter>
        <CalendarPage />
      </BrowserRouter>
    );

    const highlightedTiles = await screen.findAllByRole("button", {
      name: /\d+/,
    });

    const hasEventTiles = highlightedTiles.filter((btn) =>
      btn.className.includes("has-event")
    );

    expect(hasEventTiles.length).toBeGreaterThanOrEqual(1);
  });

  it("renders events when a date with events is clicked", async () => {
    render(
      <BrowserRouter>
        <CalendarPage />
      </BrowserRouter>
    );

    // Wait until tiles render
    const calendarButtons = await screen.findAllByRole("button", {
      name: /\d+/, // day numbers
    });

    // Click the tile labeled "22"
    const day22 = calendarButtons.find(
      (btn) =>
        btn.textContent === "22" &&
        btn.className.includes("react-calendar__tile")
    );

    expect(day22).toBeDefined();
    if (day22) {
      await userEvent.click(day22);
    }

    // Wait for the event to appear
    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /Open Mic Night/i })
      ).toBeInTheDocument();
    });
  });
});
