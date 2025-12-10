// Central plan/limit guard utilities
// Non-breaking stub to be wired into route handlers/middleware

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const matrixPath = path.join(__dirname, '..', 'config', 'planMatrix.json');
const planMatrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

function getTierConfig(tierKey) {
  const tier = planMatrix.tiers.find(t => t.key === tierKey);
  // Return the found tier or default to 'trial' (most restrictive)
  return tier || planMatrix.tiers.find(t => t.key === 'trial');
}

function overCap(value, cap) {
  if (cap == null) return false; // null means unlimited
  return value >= cap;
}

// Check student cap
function checkStudentCap({ tierKey, currentStudents }) {
  const tier = getTierConfig(tierKey);
  if (!tier || !tier.quotas) {
    console.error(`❌ Invalid tier config for tierKey: ${tierKey}`);
    // Default: allow it with conservative limits
    return {
      allowed: true,
      cap: 50,
      current: currentStudents,
      reason: null,
      upgradeTo: null,
    };
  }
  const cap = tier.quotas.students;
  const isOver = overCap(currentStudents, cap);
  return {
    allowed: !isOver,
    cap,
    current: currentStudents,
    reason: isOver ? 'student_cap_reached' : null,
    upgradeTo: isOver ? suggestUpgrade(tierKey, 'students') : null,
  };
}

// Check staff cap
function checkStaffCap({ tierKey, currentStaff }) {
  const tier = getTierConfig(tierKey);
  if (!tier || !tier.quotas) {
    console.error(`❌ Invalid tier config for tierKey: ${tierKey}`);
    // Default: allow it with conservative limits
    return {
      allowed: true,
      cap: 10,
      current: currentStaff,
      reason: null,
      upgradeTo: null,
    };
  }
  const cap = tier.quotas.staff;
  const isOver = overCap(currentStaff, cap);
  return {
    allowed: !isOver,
    cap,
    current: currentStaff,
    reason: isOver ? 'staff_cap_reached' : null,
    upgradeTo: isOver ? suggestUpgrade(tierKey, 'staff') : null,
  };
}

// Check storage cap (in GB)
function checkStorageCap({ tierKey, usedGB }) {
  const tier = getTierConfig(tierKey);
  if (!tier || !tier.quotas) {
    console.error(`❌ Invalid tier config for tierKey: ${tierKey}`);
    // Default: allow it with conservative limits
    return {
      allowed: true,
      cap: 10,
      current: usedGB,
      reason: null,
      upgradeTo: null,
    };
  }
  const cap = tier.quotas.storageGB;
  const isOver = overCap(usedGB, cap);
  return {
    allowed: !isOver,
    cap,
    current: usedGB,
    reason: isOver ? 'storage_cap_reached' : null,
    upgradeTo: isOver ? suggestUpgrade(tierKey, 'storageGB') : null,
  };
}

function suggestUpgrade(currentTierKey, quotaKey) {
  const order = ['basic', 'pro', 'enterprise'];
  const idx = order.indexOf(currentTierKey);
  const higher = planMatrix.tiers.slice(idx + 1).find(t => {
    const cap = t.quotas[quotaKey];
    return cap == null || (planMatrix.tiers[idx].quotas[quotaKey] ?? -1) < cap;
  });
  return higher ? higher.key : null;
}

// Feature gate: check if a feature is enabled in tier
function hasFeature({ tierKey, featureKey }) {
  const tier = getTierConfig(tierKey);
  const val = tier.features[featureKey];
  return Boolean(val);
}

// Trial enforcement: lock after trial days
function isTrialExpired({ trialStartISO }) {
  if (!trialStartISO) return false;
  const start = new Date(trialStartISO);
  const now = new Date();
  const days = planMatrix.trial.days || 14;
  const ms = days * 24 * 60 * 60 * 1000;
  return now - start > ms;
}

export {
  getTierConfig,
  checkStudentCap,
  checkStaffCap,
  checkStorageCap,
  hasFeature,
  isTrialExpired,
  planMatrix,
};
