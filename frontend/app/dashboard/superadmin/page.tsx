'use client';

import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { Users, Building2, TrendingUp, DollarSign, Zap, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalTenants: number;
  totalSubscriptions: number;
  totalRevenue: number;
  activeOffers: number;
  monthlyRecurringRevenue: number;
  expiredOffers: number;
}

export default function SuperAdminOverview() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalTenants: 0,
    totalSubscriptions: 0,
    totalRevenue: 0,
    activeOffers: 0,
    monthlyRecurringRevenue: 0,
    expiredOffers: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Redirect non-superadmins immediately
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'SuperAdmin') {
        console.warn('Access denied: User is not SuperAdmin');
        router.push('/dashboard/home');
      }
    }
  }, [user, loading, router]);

  // Fetch stats
  useEffect(() => {
    if (!loading && user?.role === 'SuperAdmin') {
      fetchStats();
    }
  }, [loading, user]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      let totalTenants = 0;
      let activeOffers = 0;
      let expiredOffers = 0;

      // Fetch tenants
      try {
        const tenantsRes = await fetch('/api/tenants', {
          credentials: 'include',
        });
        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json();
          totalTenants = tenantsData.data?.length || 0;
        }
      } catch (error) {
        console.warn('Warning: Could not fetch tenants:', error);
      }

      // Fetch offers
      try {
        const offersRes = await fetch('/api/offers?page=1&limit=100', {
          credentials: 'include',
        });
        if (offersRes.ok) {
          const offersData = await offersRes.json();
          const offers = offersData.offers || [];
          activeOffers = offers.filter((offer: any) => offer.isActive && new Date(offer.validUntil) > new Date()).length;
          expiredOffers = offers.filter((offer: any) => !offer.isActive || new Date(offer.validUntil) <= new Date()).length;
        }
      } catch (error) {
        console.warn('Warning: Could not fetch offers:', error);
      }

      // Set stats with defaults
      setStats({
        totalTenants: totalTenants,
        totalSubscriptions: 0, // Placeholder
        totalRevenue: 0, // Placeholder
        activeOffers: activeOffers,
        monthlyRecurringRevenue: 0, // Placeholder
        expiredOffers: expiredOffers,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is SuperAdmin (safety check)
  if (!user || user.role !== 'SuperAdmin') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">This page is only for SuperAdmins</p>
          <button
            onClick={() => router.push('/dashboard/home')}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subtext, 
    bgColor,
    href 
  }: { 
    icon: any; 
    label: string; 
    value: string | number; 
    subtext?: string;
    bgColor: string;
    href?: string;
  }) => (
    <div 
      onClick={() => href && router.push(href)}
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700 transition-all ${href ? 'cursor-pointer hover:shadow-xl hover:scale-105' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
          {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          🎯 SuperAdmin Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome back, {user.name}. Here's your platform overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Building2}
          label="Total Tenants"
          value={stats.totalTenants}
          subtext="Active institutions"
          bgColor="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          href="/dashboard/tenants"
        />
        
        <StatCard
          icon={Users}
          label="Active Subscriptions"
          value={stats.totalSubscriptions}
          subtext="Paying customers"
          bgColor="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          href="/dashboard/subscribers"
        />
        
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          subtext="All time earnings"
          bgColor="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          href="/dashboard/payments"
        />

        <StatCard
          icon={TrendingUp}
          label="Monthly Recurring"
          value={`₹${stats.monthlyRecurringRevenue.toLocaleString()}`}
          subtext="Estimated MRR"
          bgColor="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        />

        <StatCard
          icon={Zap}
          label="Active Offers"
          value={stats.activeOffers}
          subtext="Running promotions"
          bgColor="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
          href="/dashboard/admin/offers"
        />

        <StatCard
          icon={AlertCircle}
          label="Expired Offers"
          value={stats.expiredOffers}
          subtext="Need renewal"
          bgColor="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          href="/dashboard/admin/offers"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700 mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/tenants')}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-left"
          >
            <p className="font-medium text-slate-900 dark:text-white">View Tenants</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage all institutions</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/admin/offers')}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-left"
          >
            <p className="font-medium text-slate-900 dark:text-white">Manage Offers</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Create & edit promotions</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/subscribers')}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-left"
          >
            <p className="font-medium text-slate-900 dark:text-white">View Subscribers</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Check payment status</p>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <div className="flex gap-4">
          <div className="text-3xl">ℹ️</div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Need Help?</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Use the sidebar to navigate to different sections. Click on any stat card to view detailed information. 
              Visit the Offers section to create and manage promotional codes for your plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
