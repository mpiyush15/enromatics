"use client";

import { createContext, useContext, ReactNode } from 'react';
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

  return (
    <SocialMediaContext.Provider value={facebookConnection}>
      <div className="social-media-section">
        {children}
      </div>
    </SocialMediaContext.Provider>
  );
}