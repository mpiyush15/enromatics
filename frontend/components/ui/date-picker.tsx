"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  className?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  className,
  label,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Parse date string as local date to avoid timezone shift
  const parseDateString = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    value ? parseDateString(value) : new Date()
  );
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Update selected date when value prop changes
  React.useEffect(() => {
    if (value) {
      setSelectedDate(parseDateString(value));
    }
  }, [value]);

  // Close popover when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
    // Convert to YYYY-MM-DD using local date, not UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;
    onChange(isoDate);
    setIsOpen(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={cn("relative", className)} ref={popoverRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-2.5",
          "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg",
          "text-left text-sm font-medium text-gray-900 dark:text-white",
          "hover:bg-gray-50 dark:hover:bg-gray-600 transition-all",
          "focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none",
          "shadow-sm hover:shadow-md"
        )}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>{formatDate(selectedDate)}</span>
        </div>
        <svg
          className={cn(
            "w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 animate-in fade-in-0 zoom-in-95">
          <Calendar
            selected={selectedDate}
            onSelect={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      )}
    </div>
  );
}
