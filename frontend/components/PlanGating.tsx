// Frontend upsell modal and trial badge components
// Lightweight React hooks to show upgrade modals and trial info without breaking existing UI

import React, { useState, useEffect } from 'react';

/**
 * Hook: useTrialStatus
 * Returns trial days remaining, expiry date, isExpired, upgradeUrl
 */
export function useTrialStatus(trialStartISO?: string) {
  const [status, setStatus] = useState({
    daysRemaining: 0,
    expiryDate: '',
    isExpired: false,
    upgradeUrl: '/pricing',
  });

  useEffect(() => {
    if (!trialStartISO) return;

    const start = new Date(trialStartISO).getTime();
    const now = Date.now();
    const trialDays = 14;
    const ms = trialDays * 24 * 60 * 60 * 1000;
    const remaining = Math.max(0, Math.ceil((ms - (now - start)) / (24 * 60 * 60 * 1000)));
    const isExpired = now - start > ms;
    
    // Calculate expiry date
    const expiryTime = start + ms;
    const expiryDate = new Date(expiryTime).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    setStatus({ daysRemaining: remaining, expiryDate, isExpired, upgradeUrl: '/pricing' });
  }, [trialStartISO]);

  return status;
}

/**
 * Component: TrialBadge
 * Shows countdown badge on dashboard with expiry date
 */
export function TrialBadge({ trialStartISO }: { trialStartISO?: string }) {
  const { daysRemaining, expiryDate, isExpired } = useTrialStatus(trialStartISO);

  if (!trialStartISO || daysRemaining === 0 && !isExpired) return null;

  return (
    <div style={{
      background: isExpired ? '#dc2626' : '#fbbf24',
      color: isExpired ? 'white' : 'black',
      padding: '10px 14px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: 'bold',
    }}>
      {isExpired ? (
        <div>Trial expired – upgrade now</div>
      ) : (
        <div>
          <div>⏰ Trial expires on {expiryDate}</div>
          <div style={{ fontSize: '12px', marginTop: '2px' }}>({daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining)</div>
        </div>
      )}
    </div>
  );
}

/**
 * Component: UpsellModal
 * Displays when user hits a plan limit
 * Shows feature, cap, and upgrade CTA
 */
export function UpsellModal({
  isOpen,
  featureName,
  currentTier,
  suggestedTier,
  onClose,
}: {
  isOpen: boolean;
  featureName: string;
  currentTier?: string;
  suggestedTier?: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
    }}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '400px',
        textAlign: 'center',
      }}>
        <h2>Upgrade to unlock {featureName}</h2>
        <p>
          This feature is not available in your {currentTier || 'current'} plan.
          Upgrade to {suggestedTier || 'a higher plan'} to continue.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <a
            href="/pricing"
            style={{
              padding: '8px 16px',
              background: '#2F6CE5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View Plans
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Component: StorageWarning
 * Shows storage usage and warning if near cap
 */
export function StorageWarning({
  usedGB,
  capGB,
  tierName,
}: {
  usedGB: number;
  capGB: number | null;
  tierName?: string;
}) {
  if (!capGB) return null;

  const percent = Math.round((usedGB / capGB) * 100);
  const isWarning = percent >= 80;

  return (
    <div style={{
      background: isWarning ? '#fef3c7' : '#e0f2fe',
      border: `1px solid ${isWarning ? '#f59e0b' : '#0ea5e9'}`,
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '12px',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
        Storage: {usedGB} GB / {capGB} GB ({percent}%)
      </div>
      {isWarning && (
        <div style={{ fontSize: '12px', color: '#b45309', marginTop: '4px' }}>
          Approaching limit. <a href="/pricing">Upgrade</a> for more storage.
        </div>
      )}
    </div>
  );
}
