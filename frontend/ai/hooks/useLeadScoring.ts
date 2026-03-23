/**
 * AI Lead Scoring Hook
 * Calculates intelligent lead score based on multiple factors
 * Output: 0-100 score + tier (cold/warm/hot) + next best action
 */

interface ScoringFactors {
  callCount?: number;
  lastCallDate?: string;
  daysInactive?: number;
  sourceQuality?: number; // 1-10
  status?: string;
  interactionFrequency?: number;
  demoAttended?: boolean;
  responseTime?: number; // in hours
}

interface LeadScore {
  score: number;
  tier: 'cold' | 'warm' | 'hot';
  confidence: number;
  breakdown: {
    callScore: number;
    activityScore: number;
    sourceScore: number;
    statusScore: number;
    total: number;
  };
}

const SOURCE_QUALITY: Record<string, number> = {
  'walk-in': 8,
  'referral': 9,
  'instagram': 7,
  'facebook': 6,
  'website': 7,
  'whatsapp': 8,
  'google': 7,
  'other': 5,
};

const STATUS_SCORE: Record<string, number> = {
  'new': 30,
  'contacted': 40,
  'interested': 70,
  'demo': 75,
  'follow-up': 65,
  'negotiation': 85,
  'converted': 100,
  'lost': 0,
};

export function calculateLeadScore(factors: ScoringFactors): LeadScore {
  let callScore = 0;
  let activityScore = 0;
  let sourceScore = 0;
  let statusScore = 0;

  // 1. Call Score (0-30 points)
  if (factors.callCount !== undefined) {
    callScore = Math.min(30, (factors.callCount / 10) * 30);
  }

  // 2. Activity Score (0-25 points)
  if (factors.daysInactive !== undefined) {
    if (factors.daysInactive <= 1) {
      activityScore = 25; // Very active
    } else if (factors.daysInactive <= 3) {
      activityScore = 20;
    } else if (factors.daysInactive <= 7) {
      activityScore = 10;
    } else {
      activityScore = 0;
    }
  }

  // 3. Source Quality Score (0-20 points)
  if (factors.sourceQuality) {
    sourceScore = (factors.sourceQuality / 10) * 20;
  } else if (factors.status) {
    // Fallback to default source scores
    const defaultSource = SOURCE_QUALITY[factors.status] || 5;
    sourceScore = (defaultSource / 10) * 20;
  }

  // 4. Status Score (0-25 points)
  if (factors.status) {
    const statusVal = STATUS_SCORE[factors.status.toLowerCase()] || 0;
    statusScore = (statusVal / 100) * 25;
  }

  // Total score (weighted)
  const totalScore = Math.round(callScore + activityScore + sourceScore + statusScore);

  // Determine tier
  let tier: 'cold' | 'warm' | 'hot';
  if (totalScore >= 70) {
    tier = 'hot';
  } else if (totalScore >= 40) {
    tier = 'warm';
  } else {
    tier = 'cold';
  }

  // Confidence level
  const confidence = Math.min(100, totalScore + 20);

  return {
    score: totalScore,
    tier,
    confidence,
    breakdown: {
      callScore: Math.round(callScore),
      activityScore: Math.round(activityScore),
      sourceScore: Math.round(sourceScore),
      statusScore: Math.round(statusScore),
      total: totalScore,
    },
  };
}

export function getNextBestAction(score: number, tier: string, status?: string): {
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
} {
  if (tier === 'hot') {
    if (status === 'negotiation') {
      return {
        action: 'Close deal - Offer special discount',
        priority: 'critical',
        icon: '🎁',
      };
    }
    return {
      action: 'Call now (Best time: 6-8 PM)',
      priority: 'critical',
      icon: '☎️',
    };
  }

  if (tier === 'warm') {
    if (status === 'interested') {
      return {
        action: 'Schedule demo - Send meeting link',
        priority: 'high',
        icon: '📅',
      };
    }
    return {
      action: 'Send WhatsApp reminder + course details',
      priority: 'high',
      icon: '💬',
    };
  }

  return {
    action: 'Re-engage: Send special offer or follow-up',
    priority: 'medium',
    icon: '📧',
  };
}

export function getTierColor(tier: string): {
  bg: string;
  text: string;
  border: string;
  icon: string;
  darkBg: string;
  darkText: string;
  darkBorder: string;
} {
  const colors = {
    hot: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: '🔥',
      darkBg: 'dark:bg-red-900/20',
      darkText: 'dark:text-red-300',
      darkBorder: 'dark:border-red-800',
    },
    warm: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: '🟡',
      darkBg: 'dark:bg-amber-900/20',
      darkText: 'dark:text-amber-300',
      darkBorder: 'dark:border-amber-800',
    },
    cold: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: '❄️',
      darkBg: 'dark:bg-slate-900/20',
      darkText: 'dark:text-slate-300',
      darkBorder: 'dark:border-slate-800',
    },
  };

  return colors[tier as keyof typeof colors] || colors.cold;
}

export function formatLeadForDisplay(lead: any): any {
  const scoreData = calculateLeadScore({
    callCount: lead.totalCalls || 0,
    lastCallDate: lead.lastCallDate,
    daysInactive: calculateDaysInactive(lead.lastCallDate),
    sourceQuality: SOURCE_QUALITY[lead.source] || 5,
    status: lead.status,
  });

  const nextAction = getNextBestAction(scoreData.score, scoreData.tier, lead.status);
  const tierColors = getTierColor(scoreData.tier);

  return {
    ...lead,
    aiScore: scoreData.score,
    aiTier: scoreData.tier,
    aiConfidence: scoreData.confidence,
    nextAction: nextAction.action,
    actionPriority: nextAction.priority,
    actionIcon: nextAction.icon,
    tierColors,
  };
}

function calculateDaysInactive(lastCallDate?: string): number {
  if (!lastCallDate) return 999;
  const last = new Date(lastCallDate);
  const now = new Date();
  const diff = now.getTime() - last.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
