"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFacebookConnection } from "@/hooks/useFacebookConnection";

export default function SocialSettingsPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const { isConnected, connect, disconnect, userInfo, isLoading } = useFacebookConnection();

  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchPermissions();
    }
  }, [isConnected]);

  const fetchPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const response = await fetch(`/api/social/status`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success && data.permissions) {
        setPermissions(data.permissions);
      }
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Facebook account? This will remove all Facebook data and require reconnection.')) {
      const success = await disconnect();
      if (success) {
        alert('Facebook account disconnected successfully!');
      } else {
        alert('Failed to disconnect Facebook account. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href={`/dashboard/client/${tenantId}/social`}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"
              >
                ← Back to Social
              </Link>
            </div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Social Media Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Manage your Facebook account connection and permissions</p>
          </div>
        </div>

        {!isConnected ? (
          /* Connection Section */
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Connect Facebook Business Account
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">
                Connect your Facebook Business account to access advertising features
              </p>
              <button
                onClick={connect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🔗 Connect Facebook
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Account Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-light text-gray-900 dark:text-white mb-4">Account Information</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <span className="text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                    Connected
                  </span>
                </div>
                {userInfo?.name && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-light">{userInfo.name}</span>
                  </div>
                )}
                {userInfo?.email && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-light">{userInfo.email}</span>
                  </div>
                )}
                {userInfo?.id && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook ID</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-light font-mono">{userInfo.id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light text-gray-900 dark:text-white">Permissions</h2>
                <button
                  onClick={fetchPermissions}
                  disabled={loadingPermissions}
                  className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {loadingPermissions ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              <div className="space-y-2">
                {permissions.length > 0 ? (
                  permissions.map((permission) => (
                    <div key={permission} className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-light">{permission}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-light">
                    {loadingPermissions ? 'Loading permissions...' : 'No permissions data available'}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-light text-gray-900 dark:text-white mb-4">Account Actions</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm">Reconnect Account</h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-light">
                      Refresh your Facebook connection and permissions
                    </p>
                  </div>
                  <button
                    onClick={connect}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    🔄 Reconnect
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-100 text-sm">Disconnect Account</h3>
                    <p className="text-xs text-red-700 dark:text-red-300 font-light">
                      Remove Facebook connection and clear all data
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    🔌 Disconnect
                  </button>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-light text-gray-900 dark:text-white mb-4">Need Help?</h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 font-light">
                <p>• If you're experiencing connection issues, try reconnecting your account</p>
                <p>• Some features may require additional permissions from Facebook</p>
                <p>• Disconnecting will remove all Facebook data and campaigns</p>
                <p>• Contact support if you continue to experience issues</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}