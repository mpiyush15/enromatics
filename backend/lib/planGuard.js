// Central plan/limit guard utilities
// Non-breaking stub to be wired into route handlers/middleware

const fs = require('fs');
const path = require('path');

const matrixPath = path.join(__dirname, '..', 'config', 'planMatrix.json');
const planMatrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

function getTierConfig(tierKey) {
  const tier = planMatrix.tiers.find(t => t.key === tierKey);
  return tier || planMatrix.tiers.find(t => t.key === 'basic');
}

function overCap(value, cap) {
  if (cap == null) return false; // null means unlimited
  return value >= cap;
}

// Check student cap
function checkStudentCap({ tierKey, currentStudents }) {
  const tier = getTierConfig(tierKey);
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

// Check storage cap (in GB)
function checkStorageCap({ tierKey, usedGB }) {
  const tier = getTierConfig(tierKey);
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

module.exports = {
  getTierConfig,
  checkStudentCap,
  checkStorageCap,
  hasFeature,
  isTrialExpired,
  planMatrix,
};
