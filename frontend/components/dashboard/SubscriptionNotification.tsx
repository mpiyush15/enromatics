"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Clock, Info, XCircle } from "lucide-react";
import { api, safeApiCall } from "@/lib/apiClient";

interface SubscriptionNotificationProps {
  tenantId: string;
}

export default function SubscriptionNotification({ tenantId }: SubscriptionNotificationProps) {
  const [notification, setNotification] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId || dismissed) return;

    const fetchSubscriptionStatus = async () => {
      try {
        const [data, err] = await safeApiCall(() =>
          api.get(`/api/subscriptions/status/${tenantId}`)
        );

        if (!err && data?.data) {
          const sub = data.data;
          
          if (sub.requiresNotification) {
            let notif = null;
            
            if (sub.type === 'trial') {
              // Trial expiring notification
              if (sub.daysRemaining <= 0) {
                notif = {
                  type: 'error',
                  icon: '🚨',
                  title: 'Trial Expired',
                  message: 'Your free trial has ended. Upgrade now to continue using your dashboard.',
                  level: 'critical'
                };
              } else if (sub.daysRemaining <= 3) {
                notif = {
                  type: 'error',
                  icon: '⏰',
                  title: `Trial Expiring in ${sub.daysRemaining} day${sub.daysRemaining === 1 ? '' : 's'}`,
                  message: 'Your free trial is ending soon. Upgrade to keep your service active.',
                  level: 'high'
                };
              } else if (sub.daysRemaining <= 7) {
                notif = {
                  type: 'warning',
                  icon: '⚠️',
                  title: `Trial Expiring in ${sub.daysRemaining} days`,
                  message: 'Don\'t lose access. Upgrade your plan to continue.',
                  level: 'medium'
                };
              } else {
                notif = {
                  type: 'info',
                  icon: 'ℹ️',
                  title: `Trial Expiring in ${sub.daysRemaining} days`,
                  message: 'Explore upgrade options to continue your service.',
                  level: 'low'
                };
              }
            } else {
              // Paid subscription renewal notification
              if (sub.daysRemaining <= 0) {
                notif = {
                  type: 'error',
                  icon: '🔴',
                  title: 'Subscription Expired',
                  message: 'Your subscription has expired. Renew now to restore access.',
                  level: 'critical'
                };
              } else if (sub.daysRemaining <= 3) {
                notif = {
                  type: 'error',
                  icon: '⏰',
                  title: `Subscription Renews in ${sub.daysRemaining} day${sub.daysRemaining === 1 ? '' : 's'}`,
                  message: 'Ensure uninterrupted service. Review your subscription.',
                  level: 'high'
                };
              } else if (sub.daysRemaining <= 7) {
                notif = {
                  type: 'warning',
                  icon: '⚠️',
                  title: `Subscription Renews in ${sub.daysRemaining} days`,
                  message: 'Your plan will renew soon.',
                  level: 'medium'
                };
              } else if (sub.daysRemaining <= 30) {
                notif = {
                  type: 'info',
                  icon: 'ℹ️',
                  title: `Subscription Renews in ${sub.daysRemaining} days`,
                  message: 'Your subscription will renew soon.',
                  level: 'low'
                };
              }
            }
            
            setNotification(notif);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();

    // Refresh every 6 hours
    const interval = setInterval(fetchSubscriptionStatus, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tenantId, dismissed]);

  if (loading || !notification || dismissed) {
    return null;
  }

  const bgColor = {
    error: 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800'
  };

  const textColor = {
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200'
  };

  const titleColor = {
    error: 'text-red-900 dark:text-red-100',
    warning: 'text-yellow-900 dark:text-yellow-100',
    info: 'text-blue-900 dark:text-blue-100'
  };

  const buttonColor = {
    error: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600',
    warning: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600',
    info: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
  };

  return (
    <div
      className={`mx-4 mt-4 px-4 py-3 rounded-lg border ${bgColor[notification.type]} transition-all`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-xl flex-shrink-0 mt-0.5">{notification.icon}</div>

        {/* Content */}
        <div className="flex-1">
          <h4 className={`font-semibold ${titleColor[notification.type]}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${textColor[notification.type]}`}>
            {notification.message}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/dashboard/client/${tenantId}/my-subscription`}
            className={`text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap ${buttonColor[notification.type]} transition-colors`}
          >
            {notification.level === 'critical' ? 'Upgrade Now' : 'View Details'}
          </Link>

          {/* Dismiss Button */}
          <button
            onClick={() => setDismissed(true)}
            className={`p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
            aria-label="Dismiss notification"
          >
            <XCircle size={18} className={textColor[notification.type]} />
          </button>
        </div>
      </div>
    </div>
  );
}
