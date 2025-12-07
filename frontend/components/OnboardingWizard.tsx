// Frontend onboarding wizard component
// Multi-step form guiding tenants through initial setup

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: branding, 2: classes, 3: confirm
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);

  // Step 1: Branding
  const [logoUrl, setLogoUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#2F6CE5');
  const [appName, setAppName] = useState('');

  // Step 2: Classes
  const [classes, setClasses] = useState<any[]>([{ name: '', section: '' }]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/onboarding/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBranding = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/onboarding/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl, themeColor, appName }),
      });
      if (!res.ok) throw new Error('Failed to save branding');
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving branding');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = () => {
    setClasses([...classes, { name: '', section: '' }]);
  };

  const handleClassChange = (idx: number, field: string, value: string) => {
    const updated = [...classes];
    updated[idx][field] = value;
    setClasses(updated);
  };

  const handleRemoveClass = (idx: number) => {
    setClasses(classes.filter((_, i) => i !== idx));
  };

  const handleSaveClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/onboarding/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classes }),
      });
      if (!res.ok) throw new Error('Failed to create classes');
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to complete onboarding');
      router.push(data.redirectUrl || '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error completing onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '20px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
    }}>
      <h1 style={{ marginBottom: '8px' }}>Welcome to EnroMatics!</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Let's set up your institute</p>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Step 1: Branding */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Step 1: Branding</h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Institute Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g., ABC Coaching"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Theme Color</label>
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              style={{
                width: '60px',
                height: '40px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
          </div>
          <button
            onClick={handleSaveBranding}
            disabled={loading || !appName}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2F6CE5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: loading || !appName ? 0.5 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      )}

      {/* Step 2: Classes */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Step 2: Classes/Batches</h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>Add at least one class</p>
          {classes.map((cls, idx) => (
            <div key={idx} style={{ marginBottom: '12px', padding: '12px', background: '#f9fafb', borderRadius: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px' }}>
                <input
                  type="text"
                  value={cls.name}
                  onChange={(e) => handleClassChange(idx, 'name', e.target.value)}
                  placeholder="Class Name (e.g., 10th)"
                  style={{
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                  }}
                />
                <input
                  type="text"
                  value={cls.section}
                  onChange={(e) => handleClassChange(idx, 'section', e.target.value)}
                  placeholder="Section (e.g., A)"
                  style={{
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                  }}
                />
                <button
                  onClick={() => handleRemoveClass(idx)}
                  style={{
                    padding: '8px 12px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={handleAddClass}
            style={{
              marginBottom: '16px',
              padding: '8px 12px',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Add Class
          </button>
          <button
            onClick={handleSaveClasses}
            disabled={loading || !classes.some(c => c.name)}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2F6CE5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: loading || !classes.some(c => c.name) ? 0.5 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Ready to go!</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Your institute is all set up. You can now log in to your dashboard and start managing students, classes, and more.
          </p>
          <button
            onClick={handleCompleteOnboarding}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Redirecting...' : 'Go to Dashboard'}
          </button>
        </div>
      )}
    </div>
  );
}
