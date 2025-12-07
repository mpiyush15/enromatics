// Frontend gating utilities (non-breaking stubs)
// Use these to disable UI and show upsell prompts based on plan

type TierKey = 'basic' | 'pro' | 'enterprise';

export type PlanQuotas = {
  students: number | null; // null means unlimited
  staff: number | null;
  concurrentTests: number | null;
  storageGB: number | null;
};

export type TierConfig = {
  key: TierKey;
  quotas: PlanQuotas;
  features: Record<string, boolean | string>;
};

export function overCap(current: number, cap: number | null): boolean {
  if (cap === null || cap === undefined) return false;
  return current >= cap;
}

export function gateLabel(feature: string): string {
  return `This feature requires an upgrade (${feature}).`;
}

export function suggestUpgrade(current: TierKey): TierKey | null {
  const order: TierKey[] = ['basic', 'pro', 'enterprise'];
  const idx = order.indexOf(current);
  return order[idx + 1] || null;
}

export function isTrialExpired(trialStartISO?: string, trialDays = 14): boolean {
  if (!trialStartISO) return false;
  const start = new Date(trialStartISO).getTime();
  const now = Date.now();
  const ms = trialDays * 24 * 60 * 60 * 1000;
  return now - start > ms;
}
