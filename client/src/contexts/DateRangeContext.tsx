import React, { createContext, useContext, useState, ReactNode } from "react";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  presetRanges: {
    label: string;
    getValue: () => DateRange;
  }[];
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(subMonths(today, 2)),
    endDate: endOfMonth(today),
  });

  const presetRanges = [
    {
      label: "Last 30 Days",
      getValue: () => ({
        startDate: subMonths(today, 1),
        endDate: today,
      }),
    },
    {
      label: "Last 3 Months",
      getValue: () => ({
        startDate: startOfMonth(subMonths(today, 2)),
        endDate: endOfMonth(today),
      }),
    },
    {
      label: "Last 6 Months",
      getValue: () => ({
        startDate: startOfMonth(subMonths(today, 5)),
        endDate: endOfMonth(today),
      }),
    },
    {
      label: "Last 12 Months",
      getValue: () => ({
        startDate: startOfMonth(subMonths(today, 11)),
        endDate: endOfMonth(today),
      }),
    },
    {
      label: "Year to Date",
      getValue: () => ({
        startDate: new Date(today.getFullYear(), 0, 1),
        endDate: today,
      }),
    },
  ];

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange, presetRanges }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within DateRangeProvider");
  }
  return context;
}
