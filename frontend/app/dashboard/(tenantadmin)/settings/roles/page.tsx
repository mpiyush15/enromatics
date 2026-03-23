'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import RoleForm from './components/RoleForm';

// Inline RoleList Component
function RoleList({
  roles,
  selectedRole,
  onRoleSelect,
  onRoleUpdated,
  onRoleDeleted,
}: {
  roles: Role[];
  selectedRole: Role | null;
  onRoleSelect: (role: Role) => void;
  onRoleUpdated: (role: Role) => void;
  onRoleDeleted: (roleId: string) => void;
}) {
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

// Inline UserRoleAssignment Component
function UserRoleAssignment({
  roles,
  onAssignmentComplete,
}: {
  roles: Role[];
  onAssignmentComplete: () => void;
}) {
  const [users, setUsers] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users?role=tenantadmin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.ok) {
        const { data } = await res.json();
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedRole || selectedUsers.length === 0) {
      setError('Please select a role and at least one user');
      return;
    }

    setError('');
    setSuccess('');
    setAssigning(true);

    try {
      const res = await fetch('/api/user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          tenantRoleId: selectedRole,
        }),
      });

      if (!res.ok) throw new Error('Failed to assign role');

      setSuccess(`✅ Role assigned to ${selectedUsers.length} user(s)!`);
      setSelectedUsers([]);
      setSelectedRole('');

      setTimeout(() => {
        onAssignmentComplete();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Role
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choose a role --</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.roleName} ({role.userCount} user{role.userCount !== 1 ? 's' : ''})
            </option>
          ))}
        </select>
      </div>

      {selectedRole && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {(() => {
            const role = roles.find(r => r._id === selectedRole);
            return (
              <>
                <h3 className="font-bold text-blue-900 mb-2">{role?.roleName}</h3>
                <p className="text-sm text-blue-800 mb-3">{role?.description}</p>
                {role?.permissions && role.permissions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-blue-700 mb-2">Permissions ({role.permissions.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 6).map((perm) => (
                        <span key={perm} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {perm}
                        </span>
                      ))}
                      {role.permissions.length > 6 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          +{role.permissions.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Users to Assign
        </label>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No users available</div>
        ) : (
          <div className="space-y-2 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            {users.map((user) => (
              <label key={user._id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user._id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          {selectedUsers.length} user(s) selected
        </p>
      </div>

      <div>
        <button
          onClick={handleAssign}
          disabled={assigning || !selectedRole || selectedUsers.length === 0}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {assigning ? '⏳ Assigning...' : `✅ Assign Role to ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
        <p className="font-medium mb-2">💡 How to use:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Select a role from the dropdown</li>
          <li>Choose one or more users to assign the role to</li>
          <li>Click "Assign Role" to complete the assignment</li>
          <li>Users will have the permissions of this custom role</li>
        </ul>
      </div>
    </div>
  );
}

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

export default function RoleManager() {
  const { user } = useAuth();
  const router = useRouter();
  const tenantId = user?.tenantId || '';

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'assign'>('list');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Check permissions
  useEffect(() => {
    if (user && user.role?.toLowerCase() !== 'tenantadmin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch roles when user is ready
  useEffect(() => {
    if (user?.tenantId) {
      fetchRoles();
    }
  }, [user?.tenantId]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/roles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-ID': user?.tenantId || '',
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to fetch roles' }));
        throw new Error(error.message || 'Failed to fetch roles');
      }

      const { data } = await res.json();
      setRoles(data || []);
    } catch (err) {
      console.error('❌ Error fetching roles:', err);
      alert('Failed to load roles: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleCreated = (newRole: Role) => {
    setRoles([newRole, ...roles]);
    setActiveTab('list');
  };

  const handleRoleUpdated = (updatedRole: Role) => {
    setRoles(roles.map(r => r._id === updatedRole._id ? updatedRole : r));
    setSelectedRole(null);
  };

  const handleRoleDeleted = (roleId: string) => {
    setRoles(roles.filter(r => r._id !== roleId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading roles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Role Manager</h1>
          <p className="text-gray-600 mt-2">Create custom roles and assign permissions for your institution</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('list');
              setSelectedRole(null);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'list'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 All Roles ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'create'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ➕ Create Role
          </button>
          <button
            onClick={() => setActiveTab('assign')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'assign'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Assign Users
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'list' && (
            <RoleList
              roles={roles}
              onRoleSelect={setSelectedRole}
              onRoleUpdated={handleRoleUpdated}
              onRoleDeleted={handleRoleDeleted}
              selectedRole={selectedRole}
            />
          )}

          {activeTab === 'create' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Create New Role</h2>
              <RoleForm onRoleCreated={handleRoleCreated} tenantId={tenantId} />
            </div>
          )}

          {activeTab === 'assign' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Assign Users to Roles</h2>
              {roles.length > 0 ? (
                <UserRoleAssignment roles={roles} onAssignmentComplete={() => fetchRoles()} />
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>No roles available. Create a role first.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* System Roles Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">📌 System Roles</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <span className="font-semibold">🏢 tenantadmin</span>
            </div>
            <div>
              <span className="font-semibold">📚 student</span>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-4">
            💡 Tip: Create custom roles (teacher, counsellor, staff, etc.) with specific permissions for your institution.
          </p>
        </div>
      </div>
    </div>
  );
}
