'use client';

import { useState } from 'react';

interface PermissionSelectorProps {
  availablePermissions: {
    byCategory: Record<string, string[]>;
    all: string[];
    categories: string[];
  };
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

export default function PermissionSelector({
  availablePermissions,
  selectedPermissions,
  onChange,
}: PermissionSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('academics');

  const handleToggleAll = () => {
    if (selectedPermissions.length === availablePermissions.all.length) {
      onChange([]);
    } else {
      onChange(availablePermissions.all);
    }
  };

  const handleToggleCategory = (category: string) => {
    const categoryPermissions = availablePermissions.byCategory[category] || [];
    const allCategorySelected = categoryPermissions.every(p => selectedPermissions.includes(p));

    if (allCategorySelected) {
      // Deselect all in category
      onChange(selectedPermissions.filter(p => !categoryPermissions.includes(p)));
    } else {
      // Select all in category
      const newPermissions = [...new Set([...selectedPermissions, ...categoryPermissions])];
      onChange(newPermissions);
    }
  };

  const handleTogglePermission = (permission: string) => {
    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter(p => p !== permission)
      : [...selectedPermissions, permission];
    onChange(newPermissions);
  };

  return (
    <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      {/* Select All */}
      <div className="pb-4 border-b border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedPermissions.length === availablePermissions.all.length}
            onChange={handleToggleAll}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="font-semibold text-gray-900">
            {selectedPermissions.length === availablePermissions.all.length ? '✓ ' : ''}All Permissions
          </span>
        </label>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {availablePermissions.categories.map((category) => {
          const categoryPermissions = availablePermissions.byCategory[category] || [];
          const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
          const someSelected = categoryPermissions.some(p => selectedPermissions.includes(p));

          return (
            <div key={category}>
              {/* Category Header */}
              <div
                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors"
                onClick={() =>
                  setExpandedCategory(expandedCategory === category ? null : category)
                }
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => handleToggleCategory(category)}
                  onClick={(e) => e.stopPropagation()}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-800 flex-1 capitalize">
                  {category}
                </span>
                <span className="text-xs text-gray-500">
                  {categoryPermissions.filter(p => selectedPermissions.includes(p)).length}/{categoryPermissions.length}
                </span>
                <span className={`transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>

              {/* Permissions */}
              {expandedCategory === category && (
                <div className="ml-8 space-y-2 py-2">
                  {categoryPermissions.map((permission) => (
                    <label key={permission} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission)}
                        onChange={() => handleTogglePermission(permission)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono text-gray-700">
                        {permission}
                      </code>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          📊 <span className="font-semibold">{selectedPermissions.length}</span> of{' '}
          <span className="font-semibold">{availablePermissions.all.length}</span> permissions selected
        </p>
      </div>
    </div>
  );
}
