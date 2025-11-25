'use client';

import { useFacebookConnection } from '@/hooks/useFacebookConnection';
import FacebookConnectionCard from '@/components/dashboard/FacebookConnectionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Facebook, Settings, Shield, Users, BarChart3, MessageCircle } from 'lucide-react';

export default function FacebookSettingsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Facebook Integration Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage your Facebook Business account connection, permissions, and data access settings.
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
                  Connected Permissions & Access
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

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Current Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'ads_management',
                      'ads_read',
                      'business_management',
                      'pages_read_engagement',
                      'pages_read_user_content',
                      'pages_show_list',
                      'read_insights'
                    ].map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connected Assets Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Connected Ad Accounts</span>
                    <Badge>{adAccounts.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {adAccounts.length > 0 ? (
                    <div className="space-y-3">
                      {adAccounts.slice(0, 3).map((account: any) => (
                        <div key={account.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div>
                            <div className="font-medium text-sm">{account.name}</div>
                            <div className="text-xs text-gray-500">ID: {account.id}</div>
                          </div>
                          <Badge 
                            variant={account.account_status === 1 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {account.account_status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                      {adAccounts.length > 3 && (
                        <div className="text-center text-sm text-gray-500 py-2">
                          +{adAccounts.length - 3} more accounts
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
                  <CardTitle className="flex items-center justify-between">
                    <span>Connected Pages</span>
                    <Badge>{pages.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pages.length > 0 ? (
                    <div className="space-y-3">
                      {pages.slice(0, 3).map((page: any) => (
                        <div key={page.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div>
                            <div className="font-medium text-sm">{page.name}</div>
                            <div className="text-xs text-gray-500">{(page.fan_count || 0).toLocaleString()} followers</div>
                          </div>
                          <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                            Page
                          </Badge>
                        </div>
                      ))}
                      {pages.length > 3 && (
                        <div className="text-center text-sm text-gray-500 py-2">
                          +{pages.length - 3} more pages
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

            {/* Data Refresh & Management */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Sync</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      Automatically sync your Facebook data every 6 hours to ensure up-to-date analytics.
                    </p>
                    <Button variant="outline" size="sm" onClick={handleSyncNow}>
                      Sync Now
                    </Button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cache Settings</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      Clear cached Facebook data to force fresh data retrieval on next sync.
                    </p>
                    <Button variant="outline" size="sm">
                      Clear Cache
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Important Notes</h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Your Facebook access token is encrypted and stored securely</li>
                    <li>• Data is refreshed automatically but you can manually sync anytime</li>
                    <li>• Disconnecting will remove all cached Facebook data</li>
                    <li>• Some data may take up to 24 hours to appear in Facebook&apos;s API</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Why Connect Facebook?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">📊 Analytics & Insights</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li>• Real-time campaign performance data</li>
                    <li>• Audience demographics and behavior</li>
                    <li>• Post engagement and reach metrics</li>
                    <li>• ROI tracking and optimization insights</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">🚀 Management Tools</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li>• Centralized ad account management</li>
                    <li>• Multi-page content scheduling</li>
                    <li>• Campaign performance monitoring</li>
                    <li>• Automated reporting and alerts</li>
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
