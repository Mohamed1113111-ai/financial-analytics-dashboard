import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useDateRange } from "@/contexts/DateRangeContext";

export function DateRangePicker() {
  const { dateRange, setDateRange, presetRanges } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (getValue: () => { startDate: Date; endDate: Date }) => {
    setDateRange(getValue());
    setIsOpen(false);
  };

  const dateRangeLabel = `${format(dateRange.startDate, "MMM d, yyyy")} - ${format(
    dateRange.endDate,
    "MMM d, yyyy"
  )}`;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          size="sm"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">{dateRangeLabel}</span>
          <span className="sm:hidden text-xs">
            {format(dateRange.startDate, "MMM d")} - {format(dateRange.endDate, "MMM d")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-3 space-y-2">
          <p className="text-sm font-semibold text-foreground">Quick Select</p>
          {presetRanges.map((preset) => (
            <DropdownMenuItem
              key={preset.label}
              onClick={() => handlePresetClick(preset.getValue)}
              className="cursor-pointer"
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="p-3 text-xs text-muted-foreground">
          <p>Current Range:</p>
          <p className="font-semibold text-foreground mt-1">{dateRangeLabel}</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
