"use client";

import SocialMediaWrapper from '@/components/dashboard/SocialMediaWrapper';

export default function TenantSocialMediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocialMediaWrapper>
      {children}
    </SocialMediaWrapper>
  );
}