"use client";

import { useState } from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface MobileTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export default function MobileTable({ 
  columns, 
  data, 
  onRowClick, 
  loading = false,
  emptyMessage = "No data available" 
}: MobileTableProps) {
  const [pressedRow, setPressedRow] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 border-t border-gray-200 dark:border-gray-700 cursor-pointer relative overflow-hidden ${
                  pressedRow === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => onRowClick?.(row)}
                onTouchStart={() => setPressedRow(index)}
                onTouchEnd={() => setPressedRow(null)}
                onMouseLeave={() => setPressedRow(null)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {data.map((row, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 h-full flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 cursor-pointer select-none hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 relative overflow-hidden ${
              pressedRow === index ? 'scale-95 bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onClick={() => onRowClick?.(row)}
            onTouchStart={() => setPressedRow(index)}
            onTouchEnd={() => setPressedRow(null)}
            onMouseLeave={() => setPressedRow(null)}
          >
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {column.label}:
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </span>
                </div>
              ))}
            </div>
            
            {onRowClick && (
              <div className="flex justify-end mt-3">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  View Details →
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}