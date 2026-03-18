import React from 'react';
import { X } from 'lucide-react';

interface FilterPanelProps {
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

const statuses = [
  { value: 'new', label: 'New Leads', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'interested', label: 'Interested', color: 'purple' },
  { value: 'enrolled', label: 'Enrolled', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'gray' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ selectedStatus, onStatusChange }) => {
  return (
    <div className="bg-white border border-gray-200/50 rounded-2xl p-6 shadow-lg shadow-gray-900/5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {selectedStatus && (
            <button
              onClick={() => onStatusChange(null)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Status</p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => onStatusChange(selectedStatus === status.value ? null : status.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedStatus === status.value
                    ? `bg-${status.color}-600 text-white shadow-lg shadow-${status.color}-600/30`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
