'use client';

import { useState, useEffect } from 'react';

interface RoleFormProps {
  onRoleCreated: (role: any) => void;
  tenantId?: string;
}

interface AvailablePermissions {
  byCategory: Record<string, string[]>;
  all: string[];
  categories: string[];
}

interface PermissionSelectorProps {
  availablePermissions: AvailablePermissions;
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

// Inline PermissionSelector component
function PermissionSelector({
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
      onChange(selectedPermissions.filter(p => !categoryPermissions.includes(p)));
    } else {
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

      <div className="space-y-3">
        {availablePermissions.categories.map((category) => {
          const categoryPermissions = availablePermissions.byCategory[category] || [];
          const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
          const someSelected = categoryPermissions.some(p => selectedPermissions.includes(p));

          return (
            <div key={category}>
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

      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          📊 <span className="font-semibold">{selectedPermissions.length}</span> of{' '}
          <span className="font-semibold">{availablePermissions.all.length}</span> permissions selected
        </p>
      </div>
    </div>
  );
}

export default function RoleForm({ onRoleCreated, tenantId }: RoleFormProps) {
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  // Fetch available permissions on mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setPermissionsLoading(true);
        const res = await fetch('/api/roles-bff/available-permissions');
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch permissions`);
        }

        const responseData = await res.json();
        
        if (!responseData.success || !responseData.data) {
          throw new Error('Invalid response format from permissions API');
        }

        setAvailablePermissions(responseData.data);
        console.log('✅ Permissions loaded:', responseData.data.categories);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Failed to fetch permissions:', errorMsg);
        setError(`Failed to load permissions: ${errorMsg}`);
      } finally {
        setPermissionsLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          roleName,
          description,
          permissions: selectedPermissions,
          metadata: {
            icon: '👤',
            color: '#6b7280',
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create role');
      }

      const { data } = await res.json();
      setSuccess(`✅ Role "${roleName}" created successfully!`);
      
      // Reset form
      setRoleName('');
      setDescription('');
      setSelectedPermissions([]);

      // Notify parent
      onRoleCreated(data);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create role';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Role Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role Name *
        </label>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          placeholder="e.g., teacher, counsellor, staff"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use lowercase, no spaces (e.g., "senior_teacher")
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this role do?"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Permissions & Module Access
        </label>
        {permissionsLoading ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            <p>⏳ Loading permission modules...</p>
          </div>
        ) : availablePermissions ? (
          <PermissionSelector
            availablePermissions={availablePermissions}
            selectedPermissions={selectedPermissions}
            onChange={setSelectedPermissions}
          />
        ) : (
          <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg border border-red-200">
            <p>❌ Failed to load permissions. Please refresh the page.</p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          {selectedPermissions.length} permission(s) selected
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !roleName.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '⏳ Creating...' : '✅ Create Role'}
        </button>
      </div>
    </form>
  );
}
