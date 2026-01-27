import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

export const BrandingContext = createContext();

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadBranding = useCallback(async (tenantIdValue, apiUrl) => {
    if (!tenantIdValue) {
      console.error('❌ tenantId is required');
      return false;
    }

    try {
      setLoading(true);
      
      // Fetch tenant branding from backend
      const response = await axios.get(
        `${apiUrl}/api/tenants/${tenantIdValue}`,
        {
          timeout: 5000,
        }
      );

      const brandingData = response.data.branding || {};
      
      // Set default branding if not provided
      const defaultedBranding = {
        logoUrl: brandingData.logoUrl || null,
        appName: brandingData.appName || 'Student App',
        primaryColor: brandingData.themeColor || '#2563eb', // Blue default
        secondaryColor: brandingData.secondaryColor || '#1e40af',
        backgroundColor: brandingData.backgroundColor || '#f3f4f6',
        accentColor: brandingData.accentColor || '#10b981',
        textColor: '#000000',
        lightTextColor: '#666666',
      };

      console.log('✅ Branding loaded:', defaultedBranding);
      
      setBranding(defaultedBranding);
      setTenantId(tenantIdValue);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load branding:', error.message);
      
      // Use default branding on error
      setBranding({
        logoUrl: null,
        appName: 'Student App',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        backgroundColor: '#f3f4f6',
        accentColor: '#10b981',
        textColor: '#000000',
        lightTextColor: '#666666',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    branding,
    tenantId,
    loading,
    loadBranding,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}
