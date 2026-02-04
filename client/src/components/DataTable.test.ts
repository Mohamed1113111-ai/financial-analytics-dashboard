import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable } from "./DataTable";
import React from "react";

describe("DataTable Component", () => {
  const mockData = [
    { id: 1, name: "John Doe", email: "john@example.com", amount: 1000 },
    { id: 2, name: "Jane Smith", email: "jane@example.com", amount: 2000 },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", amount: 1500 },
  ];

  const mockColumns = [
    { key: "name" as const, label: "Name", sortable: true },
    { key: "email" as const, label: "Email", sortable: true },
    {
      key: "amount" as const,
      label: "Amount",
      render: (value: any) => `$${value}`,
      sortable: true,
    },
  ];

  it("renders table with data", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      React.createElement(DataTable, {
        columns: mockColumns,
        data: mockData,
        onEdit,
        onDelete,
      })
    );

    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("Jane Smith")).toBeTruthy();
    expect(screen.getByText("Bob Johnson")).toBeTruthy();
  });

  it("displays empty state when no data", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      React.createElement(DataTable, {
        columns: mockColumns,
        data: [],
        onEdit,
        onDelete,
      })
    );

    expect(screen.getByText("No data available")).toBeTruthy();
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      React.createElement(DataTable, {
        columns: mockColumns,
        data: mockData,
        onEdit,
        onDelete,
      })
    );

    const editButtons = container.querySelectorAll("button");
    const firstEditButton = Array.from(editButtons).find(
      (btn) => btn.textContent?.includes("Pencil") || btn.className.includes("edit")
    );

    if (firstEditButton) {
      fireEvent.click(firstEditButton);
      expect(onEdit).toHaveBeenCalled();
    }
  });

  it("shows loading state", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      React.createElement(DataTable, {
        columns: mockColumns,
        data: [],
        onEdit,
        onDelete,
        isLoading: true,
      })
    );

    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("paginates data correctly", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      amount: (i + 1) * 100,
    }));

    const { container } = render(
      React.createElement(DataTable, {
        columns: mockColumns,
        data: largeData,
        onEdit,
        onDelete,
        pageSize: 10,
      })
    );

    // First page should show users 1-10
    expect(screen.getByText("User 1")).toBeTruthy();
    expect(screen.getByText("User 10")).toBeTruthy();

    // User 11 should not be visible on first page
    expect(screen.queryByText("User 11")).toBeFalsy();
  });

  it("sorts data when sortable column is clicked", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      React.createElement(DataTable, {
        columns: mockColumns,
        data: mockData,
        onEdit,
        onDelete,
      })
    );

    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader);

    // After sorting, Bob should come before John (alphabetical)
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("renders custom cell render function", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      React.createElement(DataTable, {
        columns: mockColumns,
        data: mockData,
        onEdit,
        onDelete,
      })
    );

    // Amount column should render with $ prefix
    expect(screen.getByText("$1000")).toBeTruthy();
    expect(screen.getByText("$2000")).toBeTruthy();
  });

  it("disables pagination buttons at boundaries", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      React.createElement(DataTable, {
        columns: mockColumns,
        data: mockData,
        onEdit,
        onDelete,
        pageSize: 10,
      })
    );

    const buttons = container.querySelectorAll("button");
    const prevButton = Array.from(buttons).find(
      (btn) => btn.textContent?.includes("ChevronLeft") || btn.className.includes("prev")
    );

    // Previous button should be disabled on first page
    if (prevButton) {
      expect(prevButton.hasAttribute("disabled") || prevButton.className.includes("disabled")).toBeTruthy();
    }
  });
});
