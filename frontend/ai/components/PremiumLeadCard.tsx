/**
 * Premium AI Lead Card Component
 * Glassy finish with light blue accent + AI scoring
 * Full dark/light mode support
 */

import React from 'react';
import { Phone, MessageCircle, Calendar, Zap, TrendingUp } from 'lucide-react';

interface LeadCardProps {
  lead: any;
  onCall?: (leadId: string) => void;
  onWhatsApp?: (leadId: string) => void;
  onSchedule?: (leadId: string) => void;
  onViewInsights?: (leadId: string) => void;
}

export default function PremiumLeadCard({
  lead,
  onCall,
  onWhatsApp,
  onSchedule,
  onViewInsights,
}: LeadCardProps) {
  const score = lead.aiScore || 0;
  const tier = lead.aiTier || 'cold';
  const tierColors = lead.tierColors || {};
  const nextAction = lead.nextAction || 'No action';

  const getTierGradient = () => {
    switch (tier) {
      case 'hot':
        return 'from-red-600 to-red-400';
      case 'warm':
        return 'from-amber-600 to-amber-400';
      default:
        return 'from-blue-600 to-blue-400';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105">
      {/* Glassy Background */}
      <div
        className={`absolute inset-0 ${
          tier === 'hot' ? 'bg-red-50' : tier === 'warm' ? 'bg-amber-50' : 'bg-blue-50'
        } dark:${
          tier === 'hot'
            ? 'dark:bg-red-900/10'
            : tier === 'warm'
              ? 'dark:bg-amber-900/10'
              : 'dark:bg-blue-900/10'
        } backdrop-blur-xl bg-opacity-40 dark:bg-opacity-20`}
      />

      {/* Border Gradient */}
      <div
        className={`absolute inset-0 rounded-2xl border-2 ${
          tier === 'hot'
            ? 'border-red-200 dark:border-red-800/50'
            : tier === 'warm'
              ? 'border-amber-200 dark:border-amber-800/50'
              : 'border-blue-200 dark:border-blue-800/50'
        }`}
      />

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header: Name + Score Badge */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {lead.name || 'Lead'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {lead.source || 'Unknown'} • {lead.phone || 'N/A'}
            </p>
          </div>

          {/* AI Score Badge */}
          <div
            className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-gradient-to-br ${getTierGradient()} shadow-lg`}
          >
            <span className="text-2xl font-bold text-white">{score}</span>
            <span className="text-xs font-semibold text-white/90">AI</span>
          </div>
        </div>

        {/* Status + Tier */}
        <div className="mb-4 flex gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${tierColors.bg} ${tierColors.text}`}
          >
            {tierColors.icon} {tier.toUpperCase()}
          </span>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {lead.status || 'new'}
          </span>
        </div>

        {/* Next Best Action - AI Powered */}
        <div
          className={`mb-4 rounded-lg bg-gradient-to-r ${
            lead.actionPriority === 'critical'
              ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10'
              : 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10'
          } p-3 border ${
            lead.actionPriority === 'critical'
              ? 'border-red-200 dark:border-red-800/50'
              : 'border-blue-200 dark:border-blue-800/50'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg">{lead.actionIcon || '🎯'}</span>
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                AI RECOMMENDED ACTION
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {nextAction}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/50 dark:bg-slate-800/50 p-2 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">Calls</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {lead.totalCalls || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white/50 dark:bg-slate-800/50 p-2 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">Days Active</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {lead.daysActive || 5}
            </p>
          </div>
          <div className="rounded-lg bg-white/50 dark:bg-slate-800/50 p-2 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">Interest</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {lead.interestLevel || '—'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onCall && onCall(lead.id)}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-3 py-2 text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg dark:from-blue-600 dark:to-blue-700"
          >
            <Phone className="h-4 w-4" />
            Call
          </button>
          <button
            onClick={() => onWhatsApp && onWhatsApp(lead.id)}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-3 py-2 text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg dark:from-green-600 dark:to-green-700"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
          <button
            onClick={() => onViewInsights && onViewInsights(lead.id)}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-blue-300 bg-white/50 hover:bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition-all dark:border-blue-800 dark:bg-slate-800/50 dark:hover:bg-slate-700 dark:text-blue-300"
          >
            <Zap className="h-4 w-4" />
            Insights
          </button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity ${
          tier === 'hot'
            ? 'bg-red-500'
            : tier === 'warm'
              ? 'bg-amber-500'
              : 'bg-blue-500'
        }`}
      />
    </div>
  );
}
