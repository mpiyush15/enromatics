"use client";

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useFacebookConnection } from '@/hooks/useFacebookConnection';

// Context to share Facebook connection state across social media pages
interface SocialMediaContextType {
  isConnected: boolean;
  userInfo: any;
  pages: any[];
  adAccounts: any[];
  connectToFacebook: () => void;
  disconnectFromFacebook: () => void;
  loading: boolean;
  error: string | null;
}

const SocialMediaContext = createContext<SocialMediaContextType | null>(null);

export const useSocialMediaContext = () => {
  const context = useContext(SocialMediaContext);
  if (!context) {
    throw new Error('useSocialMediaContext must be used within a SocialMediaWrapper');
  }
  return context;
};

interface SocialMediaWrapperProps {
  children: ReactNode;
}

export default function SocialMediaWrapper({ children }: SocialMediaWrapperProps) {
  const facebookConnection = useFacebookConnection();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => facebookConnection, [
    facebookConnection.isConnected,
    facebookConnection.userInfo,
    facebookConnection.pages,
    facebookConnection.adAccounts,
    facebookConnection.loading,
    facebookConnection.error
  ]);

  return (
    <SocialMediaContext.Provider value={contextValue}>
      <div className="social-media-section">
        {children}
      </div>
    </SocialMediaContext.Provider>
  );
}