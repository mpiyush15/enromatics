import OnboardingWizard from '@/components/OnboardingWizard';

export default function OnboardingPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Complete Your Onboarding</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Set up your institute branding, add classes, and get your portal ready to use.
      </p>
      <OnboardingWizard />
    </div>
  );
}
