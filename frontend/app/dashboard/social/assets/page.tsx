'use client';

import { useEffect, useState } from 'react';
import { useFacebookConnection } from '@/hooks/useFacebookConnection';
import FacebookConnectionCard from '@/components/dashboard/FacebookConnectionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SuperAdminBusinessAssetsPage() {
  const { isConnected, pages, adAccounts, refresh } = useFacebookConnection();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Business Assets
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect Facebook to access platform business assets and pages.
          </p>
          <FacebookConnectionCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🎨 Platform Business Assets
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and overview all Facebook business assets available to the platform
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center">
          <FacebookConnectionCard />
        </div>

        {/* Assets Overview */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Ad Accounts</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💼 Ad Accounts
                    <Badge>{adAccounts.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{adAccounts.length}</div>
                  <p className="text-sm text-gray-600">Connected ad accounts available for platform campaigns</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📄 Pages
                    <Badge>{pages.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">{pages.length}</div>
                  <p className="text-sm text-gray-600">Facebook pages accessible through platform integration</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    👥 Total Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {pages.reduce((sum: number, page: any) => sum + (page.fan_count || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Combined followers across all platform pages</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Platform Ad Accounts</CardTitle>
                  <Button variant="outline" onClick={refresh}>Refresh Data</Button>
                </div>
              </CardHeader>
              <CardContent>
                {adAccounts.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {adAccounts.map((account: any) => (
                      <div key={account.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{account.name}</h3>
                            <p className="text-sm text-gray-600">ID: {account.id}</p>
                          </div>
                          <Badge variant={account.account_status === 1 ? "default" : "secondary"}>
                            {account.account_status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Currency</p>
                            <p className="font-medium">{account.currency || 'USD'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <p className="font-medium">{account.account_status === 1 ? 'Active' : 'Inactive'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="text-xl font-semibold mb-2">No Ad Accounts Found</h3>
                    <p className="text-gray-600">No ad accounts are currently connected to this Facebook integration.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Platform Facebook Pages</CardTitle>
                  <Button variant="outline" onClick={refresh}>Refresh Data</Button>
                </div>
              </CardHeader>
              <CardContent>
                {pages.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pages.map((page: any) => (
                      <div key={page.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{page.name}</h3>
                            <p className="text-sm text-gray-600">ID: {page.id}</p>
                          </div>
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            Page
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Followers</p>
                            <p className="font-medium text-lg text-blue-600">
                              {(page.fan_count || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Category</p>
                            <p className="font-medium">{page.category || 'Business'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold mb-2">No Pages Found</h3>
                    <p className="text-gray-600">No Facebook pages are currently connected to this integration.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">Platform Analytics Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Comprehensive platform-wide analytics and insights will be available here.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl mb-2">📈</div>
                      <div className="font-semibold">Performance Metrics</div>
                      <div className="text-sm text-gray-600">Platform-wide campaign performance</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl mb-2">👥</div>
                      <div className="font-semibold">Audience Analytics</div>
                      <div className="text-sm text-gray-600">Aggregated audience insights</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl mb-2">💰</div>
                      <div className="font-semibold">Revenue Tracking</div>
                      <div className="text-sm text-gray-600">Platform revenue attribution</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}