'use client';

import { useState } from 'react';

interface Role {
  _id: string;
  roleName: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  metadata?: {
    icon?: string;
    color?: string;
  };
}

interface RoleListProps {
  roles: Role[];
  selectedRole: Role | null;
  onRoleSelect: (role: Role) => void;
  onRoleUpdated: (role: Role) => void;
  onRoleDeleted: (roleId: string) => void;
}

export default function RoleList({
  roles,
  selectedRole,
  onRoleSelect,
  onRoleUpdated,
  onRoleDeleted,
}: RoleListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleEdit = (role: Role) => {
    setEditingId(role._id);
    setEditDescription(role.description);
    setEditPermissions(role.permissions);
    onRoleSelect(role);
  };

  const handleSave = async (roleId: string) => {
    if (!editingId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          description: editDescription,
          permissions: editPermissions,
        }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      const { data } = await res.json();
      onRoleUpdated(data);
      setEditingId(null);
    } catch (err) {
      alert('❌ ' + (err instanceof Error ? err.message : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    setDeleting(roleId);
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete role');

      onRoleDeleted(roleId);
    } catch (err) {
      alert('❌ ' + (err instanceof Error ? err.message : 'Failed to delete'));
    } finally {
      setDeleting(null);
    }
  };

  if (roles.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 text-lg">No custom roles yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {roles.map((role) => (
        <div key={role._id} className="p-6 hover:bg-gray-50 transition-colors">
          {editingId === role._id ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{role.roleName}</h3>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="bg-gray-100 p-3 rounded-lg max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {editPermissions.map((perm) => (
                      <span
                        key={perm}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                      >
                        {perm}
                        <button
                          type="button"
                          onClick={() =>
                            setEditPermissions(editPermissions.filter(p => p !== perm))
                          }
                          className="text-blue-900 hover:text-blue-700 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSave(role._id)}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? '⏳ Saving...' : '✅ Save'}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{role.metadata?.icon || '👤'}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 capitalize">{role.roleName}</h3>
                      <p className="text-sm text-gray-600">{role.description || 'No description'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(role._id)}
                    disabled={role.userCount > 0 || deleting === role._id}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      role.userCount > 0
                        ? `Cannot delete - ${role.userCount} user(s) assigned`
                        : ''
                    }
                  >
                    {deleting === role._id ? '⏳' : '🗑️'} Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Users Assigned</span>
                  <p className="font-semibold text-gray-900">{role.userCount}</p>
                </div>
                <div>
                  <span className="text-gray-500">Permissions</span>
                  <p className="font-semibold text-gray-900">{role.permissions.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <p className="font-semibold text-green-600">
                    {role.isActive ? '✓ Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              {role.permissions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.slice(0, 5).map((perm) => (
                      <span
                        key={perm}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                      >
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
