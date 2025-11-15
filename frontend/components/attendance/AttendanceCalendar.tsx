"use client";

import { useState } from "react";

interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
}

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
}

const statusColors = {
  present: "bg-green-500 hover:bg-green-600",
  absent: "bg-red-500 hover:bg-red-600",
  late: "bg-yellow-500 hover:bg-yellow-600",
  excused: "bg-purple-500 hover:bg-purple-600",
};

const statusEmojis = {
  present: "✓",
  absent: "✗",
  late: "⏰",
  excused: "📝",
};

export default function AttendanceCalendar({
  records,
  month,
  year,
  onMonthChange,
}: AttendanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<AttendanceRecord | null>(null);

  // Create a map for quick lookup
  const recordMap = new Map<string, AttendanceRecord>();
  records.forEach((record) => {
    const date = new Date(record.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
    recordMap.set(key, record);
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const handleToday = () => {
    const today = new Date();
    onMonthChange(today.getMonth() + 1, today.getFullYear());
  };

  const days = [];
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-16 md:h-20"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const record = recordMap.get(dateKey);
    const isToday =
      new Date().getDate() === day &&
      new Date().getMonth() === month - 1 &&
      new Date().getFullYear() === year;

    days.push(
      <div
        key={day}
        onClick={() => record && setSelectedDate(record)}
        className={`h-16 md:h-20 border border-gray-200 dark:border-gray-700 rounded-lg p-1 md:p-2 flex flex-col items-center justify-center transition-all ${
          record ? `cursor-pointer ${statusColors[record.status]}` : "bg-gray-50 dark:bg-gray-800"
        } ${isToday ? "ring-2 ring-blue-500" : ""} hover:scale-105`}
      >
        <span
          className={`text-xs md:text-sm font-semibold ${
            record ? "text-white" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {day}
        </span>
        {record && (
          <span className="text-lg md:text-2xl text-white mt-1">{statusEmojis[record.status]}</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
        >
          ←
        </button>
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
            {monthNames[month - 1]} {year}
          </h2>
          <button
            onClick={handleToday}
            className="text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
          >
            Go to Today
          </button>
        </div>
        <button
          onClick={handleNextMonth}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
        >
          →
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">{days}</div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Legend:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs">
              ✓
            </div>
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs">
              ✗
            </div>
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white text-xs">
              ⏰
            </div>
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-white text-xs">
              📝
            </div>
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Excused</span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Attendance Details</h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {new Date(selectedDate.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <p
                  className={`text-lg font-semibold capitalize ${
                    selectedDate.status === "present"
                      ? "text-green-600"
                      : selectedDate.status === "absent"
                      ? "text-red-600"
                      : selectedDate.status === "late"
                      ? "text-yellow-600"
                      : "text-purple-600"
                  }`}
                >
                  {selectedDate.status} {statusEmojis[selectedDate.status]}
                </p>
              </div>
              {selectedDate.remarks && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Remarks:</span>
                  <p className="text-gray-800 dark:text-white">{selectedDate.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
