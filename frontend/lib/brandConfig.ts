/**
 * Brand Configuration for White-Label Mobile Apps
 */

export interface BrandConfig {
  appName: string;
  appId: string;
  primaryColor: string;
  logo: string;
  splashColor: string;
  singleTenant?: string; // If set, app only shows this tenant
}

export const getBrandConfig = (): BrandConfig => {
  const whiteLabel = process.env.NEXT_PUBLIC_WHITE_LABEL === 'true';
  
  if (whiteLabel) {
    return {
      appName: process.env.NEXT_PUBLIC_BRAND_NAME || 'Custom Institute',
      appId: process.env.NEXT_PUBLIC_BRAND_PACKAGE || 'com.custom.app',
      primaryColor: process.env.NEXT_PUBLIC_BRAND_COLOR || '#1E40AF',
      logo: process.env.NEXT_PUBLIC_BRAND_LOGO || '/custom-logo.png',
      splashColor: process.env.NEXT_PUBLIC_BRAND_COLOR || '#1E40AF',
      singleTenant: process.env.NEXT_PUBLIC_TENANT_ID
    };
  }

  // Default Enromatics branding
  return {
    appName: 'Enromatics',
    appId: 'com.enromatics.app',
    primaryColor: '#4F46E5',
    logo: '/enromatics-logo.png',
    splashColor: '#4F46E5'
  };
};

// Usage in components
export const useBrandConfig = () => {
  return getBrandConfig();
};