'use client';

import { useState, useEffect } from 'react';

interface Role {
  _id: string;
  roleName: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface UserRoleAssignmentProps {
  roles: Role[];
  onAssignmentComplete: () => void;
}

export default function UserRoleAssignment({ roles, onAssignmentComplete }: UserRoleAssignmentProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch available users
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

      // Refresh data
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

      {/* Role Selection */}
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

      {/* Role Details */}
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

      {/* User Selection */}
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

      {/* Bulk Assign Button */}
      <div>
        <button
          onClick={handleAssign}
          disabled={assigning || !selectedRole || selectedUsers.length === 0}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {assigning ? '⏳ Assigning...' : `✅ Assign Role to ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Info Card */}
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
