'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LogOut, Settings, BarChart3, Users, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

interface TenantBranding {
  instituteName: string;
  logoUrl?: string;
  themeColor: string;
  whatsappNumber?: string;
  subdomain: string;
}

interface DashboardData {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  activeUsers: number;
}

export default function TenantDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subdomain = searchParams?.get('subdomain') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/tenant-login?subdomain=${subdomain}`);
      return;
    }

    loadData();
  }, [subdomain]);

  const loadData = async () => {
    try {
      // Fetch branding
      const brandingRes = await fetch(`/api/tenant/branding-by-subdomain?subdomain=${subdomain}`);
      if (brandingRes.ok) {
        const brandingData = await brandingRes.json();
        setBranding(brandingData);
      }

      // Fetch dashboard data
      const dashboardRes = await fetch(`/api/tenant/dashboard?subdomain=${subdomain}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboardData(data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Load data error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    router.push(`/tenant-login?subdomain=${subdomain}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950"
      style={{
        backgroundImage: branding?.themeColor
          ? `linear-gradient(135deg, ${branding.themeColor}10 0%, rgba(59, 130, 246, 0.05) 100%)`
          : undefined,
      }}
    >
      {/* Header */}
      <header
        className="shadow-sm border-b border-gray-200 dark:border-gray-700"
        style={{
          backgroundColor: branding?.themeColor
            ? `${branding.themeColor}08`
            : undefined,
          borderBottomColor: branding?.themeColor || '#e5e7eb',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {branding?.logoUrl && (
              <img
                src={branding.logoUrl}
                alt={branding.instituteName}
                className="h-10 rounded-lg"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {branding?.instituteName || 'Portal'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {branding?.subdomain}.enromatics.com
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-12 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
          style={{
            backgroundColor: branding?.themeColor
              ? `${branding.themeColor}08`
              : '#f0f9ff',
            borderColor: branding?.themeColor || '#e0f2fe',
          }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Your Portal! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your branded portal is now live and ready to serve your students. Below you'll find quick statistics and management options.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Students"
            value={dashboardData?.totalStudents || 0}
            color={branding?.themeColor}
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Active Courses"
            value={dashboardData?.totalCourses || 0}
            color={branding?.themeColor}
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Active Users"
            value={dashboardData?.activeUsers || 0}
            color={branding?.themeColor}
          />
          <StatCard
            icon={<span className="text-lg">₹</span>}
            label="Total Revenue"
            value={dashboardData?.totalRevenue || 0}
            isCurrency
            color={branding?.themeColor}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionButton
              label="Manage Students"
              icon={<Users className="w-5 h-5" />}
              href="/manage/students"
              color={branding?.themeColor}
            />
            <QuickActionButton
              label="Manage Courses"
              icon={<BookOpen className="w-5 h-5" />}
              href="/manage/courses"
              color={branding?.themeColor}
            />
            <QuickActionButton
              label="View Analytics"
              icon={<BarChart3 className="w-5 h-5" />}
              href="/analytics"
              color={branding?.themeColor}
            />
          </div>
        </div>

        {/* Support Footer */}
        {branding?.whatsappNumber && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Need assistance?
            </p>
            <a
              href={`https://wa.me/${branding.whatsappNumber.replace(/\s+/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: branding.themeColor || '#3b82f6' }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.918 1.339c-1.532.912-2.814 2.303-3.667 3.982-.854 1.68-1.27 3.581-.918 5.4.354 1.819 1.23 3.42 2.548 4.584 1.319 1.164 3.04 1.95 4.977 2.267 1.278.195 2.611.099 3.857-.281 1.246-.379 2.384-.999 3.266-1.818.883-.819 1.503-1.839 1.857-2.96.354-1.12.379-2.361.074-3.518-.305-1.156-.962-2.194-1.854-2.975-.893-.78-1.968-1.277-3.092-1.465-.774-.123-1.607-.085-2.414.124z" />
              </svg>
              Contact Support
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  isCurrency = false,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  isCurrency?: boolean;
  color?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: color ? `${color}20` : '#f0f9ff', color: color || '#3b82f6' }}
      >
        {icon}
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {isCurrency ? `₹${value.toLocaleString('en-IN')}` : value.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

function QuickActionButton({
  label,
  icon,
  href,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  href: string;
  color?: string;
}) {
  return (
    <a
      href={href}
      className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all flex flex-col items-center gap-3 text-center hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: color ? `${color}20` : '#f0f9ff', color: color || '#3b82f6' }}
      >
        {icon}
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{label}</span>
    </a>
  );
}
