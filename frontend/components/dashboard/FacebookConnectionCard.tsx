'use client';

import { useFacebookConnection } from '@/hooks/useFacebookConnection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Facebook, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function FacebookConnectionCard() {
  const { 
    isConnected, 
    isLoading, 
    userInfo, 
    error, 
    pages, 
    adAccounts,
    connect, 
    disconnect,
    refresh
  } = useFacebookConnection();
  
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Facebook account? This will remove access to all Facebook features.')) {
      setIsDisconnecting(true);
      try {
        const success = await disconnect();
        if (success) {
          // Optionally show success message
        } else {
          alert('Failed to disconnect Facebook account. Please try again.');
        }
      } catch (error) {
        console.error('Error disconnecting:', error);
        alert('Failed to disconnect Facebook account. Please try again.');
      } finally {
        setIsDisconnecting(false);
      }
    }
  };

  const handleRefresh = () => {
    refresh();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking Facebook connection...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            Facebook Connection
          </CardTitle>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
          >
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {isConnected ? (
          <div className="space-y-3">
            {userInfo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-3">
                  {userInfo.picture && (
                    <img 
                      src={userInfo.picture} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{userInfo.name || 'Facebook User'}</p>
                    <p className="text-xs text-gray-600">{userInfo.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-lg">{pages.length}</div>
                <div className="text-sm text-gray-600">Pages</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-lg">{adAccounts.length}</div>
                <div className="text-sm text-gray-600">Ad Accounts</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Refresh
              </Button>
              <Button 
                onClick={handleDisconnect}
                variant="destructive"
                size="sm"
                className="flex-1"
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              Connect your Facebook account to access business assets, manage posts, and view analytics.
            </p>
            <Button 
              onClick={handleConnect}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Connect Facebook
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}