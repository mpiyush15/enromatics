'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface Subscriber {
  _id: string;
  tenantId: string;
  name: string;
  instituteName: string;
  email: string;
  plan: string;
  active: boolean;
  contact?: {
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  subscription: {
    status: string;
    paymentId: string;
    startDate: string;
    endDate: string;
    billingCycle?: string;
  };
  createdAt: string;
}

export default function SuperAdminSubscribersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && user?.role !== 'SuperAdmin') {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user?.role === 'SuperAdmin') {
      fetchSubscribers();
    }
  }, [user, authLoading]);

  useEffect(() => {
    let result = [...subscribers];

    // Apply plan filter
    if (planFilter !== 'all') {
      result = result.filter(s => s.plan === planFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.instituteName?.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.tenantId.toLowerCase().includes(query)
      );
    }

    setFilteredSubscribers(result);
  }, [subscribers, searchQuery, planFilter]);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/subscribers', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers || []);
      } else {
        toast.error('Failed to load subscribers');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Error loading subscribers');
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusBadge = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
          <XCircle className="w-3 h-3" />
          Expired
        </span>
      );
    } else if (daysRemaining <= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
          <Clock className="w-3 h-3" />
          Expiring Soon
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'SuperAdmin') {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Subscribers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            All tenants with active subscriptions
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full font-medium">
            {subscribers.length} Active Subscribers
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, institute, email, or tenant ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Plans</option>
            <option value="test">Test</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Subscribers Grid */}
      {filteredSubscribers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {subscribers.length === 0 ? 'No active subscribers yet' : 'No matching subscribers found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscribers.map((subscriber) => {
            const daysRemaining = getDaysRemaining(subscriber.subscription.endDate);
            
            return (
              <div 
                key={subscriber._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {subscriber.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {subscriber.instituteName || 'No institute name'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(daysRemaining)}
                  </div>

                  {/* Plan Badge */}
                  <div className="mb-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
                      subscriber.plan === 'enterprise' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' :
                      subscriber.plan === 'professional' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                      subscriber.plan === 'starter' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {subscriber.plan} Plan
                    </span>
                    {subscriber.subscription.billingCycle && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 capitalize">
                        ({subscriber.subscription.billingCycle})
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{subscriber.email}</span>
                    </div>
                    {subscriber.contact?.phone && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>{subscriber.contact.phone}</span>
                      </div>
                    )}
                    {(subscriber.contact?.city || subscriber.contact?.state) && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {[subscriber.contact.city, subscriber.contact.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Expires: {new Date(subscriber.subscription.endDate).toLocaleDateString()}
                        {daysRemaining > 0 && (
                          <span className="ml-1 text-gray-500">({daysRemaining} days)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => router.push(`/dashboard/tenants/${subscriber.tenantId}`)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
