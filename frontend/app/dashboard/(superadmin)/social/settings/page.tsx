'use client';

import { useFacebookConnection } from '@/hooks/useFacebookConnection';
import FacebookConnectionCard from '@/components/dashboard/FacebookConnectionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, Settings, Shield, Users, BarChart3, MessageCircle } from 'lucide-react';

export default function SuperAdminFacebookSettingsPage() {
  const { isConnected, userInfo, pages, adAccounts, refresh } = useFacebookConnection();

  const handleSyncNow = () => {
    refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Facebook className="h-12 w-12 text-blue-600" />
            <Settings className="h-8 w-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Facebook Integration Settings (SuperAdmin)
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage Facebook Business account connection, permissions, and data access settings for the platform.
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center">
          <FacebookConnectionCard />
        </div>

        {isConnected && (
          <>
            {/* Permissions & Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Platform Facebook Integration Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-sm">Business Analytics</div>
                    <div className="text-xs text-green-700 dark:text-green-300">Active</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-semibold text-sm">Page Management</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Active</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-semibold text-sm">Marketing API</div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">Active</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                    <Settings className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="font-semibold text-sm">Ad Management</div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">Active</div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">🔧 SuperAdmin Notice</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    As SuperAdmin, this Facebook connection will be used as the platform's default integration. 
                    Individual tenants can override this with their own Facebook connections if needed.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Connected Assets Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Ad Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Ad accounts accessible through the platform Facebook integration:
                  </p>
                  {adAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {adAccounts.slice(0, 5).map((account: any) => (
                        <div key={account.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <div>
                            <div className="font-medium text-sm">{account.name}</div>
                            <div className="text-xs text-gray-500">ID: {account.id}</div>
                          </div>
                        </div>
                      ))}
                      {adAccounts.length > 5 && (
                        <div className="text-center text-sm text-gray-500 py-2">
                          +{adAccounts.length - 5} more accounts
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No ad accounts found
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Facebook pages accessible through the platform integration:
                  </p>
                  {pages.length > 0 ? (
                    <div className="space-y-2">
                      {pages.slice(0, 5).map((page: any) => (
                        <div key={page.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <div>
                            <div className="font-medium text-sm">{page.name}</div>
                            <div className="text-xs text-gray-500">{(page.fan_count || 0).toLocaleString()} followers</div>
                          </div>
                        </div>
                      ))}
                      {pages.length > 5 && (
                        <div className="text-center text-sm text-gray-500 py-2">
                          +{pages.length - 5} more pages
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No pages found
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Platform Management */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Synchronization</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      Refresh platform Facebook data and sync with all tenants using default integration.
                    </p>
                    <Button variant="outline" size="sm" onClick={handleSyncNow}>
                      Sync Platform Data
                    </Button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Integration Health</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      Monitor the health and performance of the Facebook integration across the platform.
                    </p>
                    <Button variant="outline" size="sm">
                      View Health Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Facebook Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Facebook className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Connect Platform Facebook Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  As SuperAdmin, connecting a Facebook account will establish the default platform integration. 
                  This will enable social media features across all tenants unless they configure their own connections.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Platform Benefits:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 text-left space-y-1">
                    <li>• Centralized social media analytics for all tenants</li>
                    <li>• Default Facebook integration for new tenants</li>
                    <li>• Platform-wide campaign and performance insights</li>
                    <li>• Streamlined social media management tools</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}