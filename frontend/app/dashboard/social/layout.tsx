"use client";

import SocialMediaWrapper from '@/components/dashboard/SocialMediaWrapper';

export default function SocialMediaLayout({
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