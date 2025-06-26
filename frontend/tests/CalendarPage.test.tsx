import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import CalendarPage from "../src/components/CalendarPage";

describe("CalendarPage", () => {
  it("renders the calendar header and instruction", () => {
    render(
      <BrowserRouter>
        <CalendarPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Event Calendar")).toBeInTheDocument();
    expect(
      screen.getByText("Select a date to view events.")
    ).toBeInTheDocument();
  });
});
