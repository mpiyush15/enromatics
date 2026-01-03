'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Plus, Edit2, MoreVertical, Trash2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api, safeApiCall } from '@/lib/apiClient';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import useAuth from '@/hooks/useAuth';
import UpgradeRequired from '@/components/UpgradeRequired';

interface Workflow {
  _id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive' | 'draft';
  isPublished: boolean;
  linkedPhoneNumber: string;
  triggerKeyword: string;
  conversationCount: number;
  completionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AutomationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasFeature, loading: featureLoading } = useFeatureGate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'inactive'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // SuperAdmin or user with WABA feature
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const canAccess = isSuperAdmin || hasFeature("waba");

  // Fetch workflows
  useEffect(() => {
    if (!authLoading && !featureLoading && canAccess) {
      fetchWorkflows();
    }
  }, [filter, authLoading, featureLoading, canAccess]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError('');
      const url = filter === 'all' 
        ? '/api/whatsapp/automation/workflows'
        : `/api/whatsapp/automation/workflows?status=${filter}`;
      console.log('🔍 Fetching workflows from:', url);
      const [data, err] = await safeApiCall(() => api.get<any>(url));
      if (err) {
        console.error('❌ Error fetching workflows:', err);
        setError(`API Error: ${err.message || 'Failed to load workflows'}`);
        return;
      }
      console.log('✅ Workflows fetched:', data);
      setWorkflows(data?.workflows || []);
    } catch (err: any) {
      console.error('❌ Unexpected error:', err);
      setError('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workflowId: string) => {
    try {
      const [, err] = await safeApiCall(() => api.delete(`/api/whatsapp/automation/workflows/${workflowId}`));
      if (err) {
        setError(err.message || 'Failed to delete workflow');
        return;
      }
      setWorkflows(workflows.filter(w => w._id !== workflowId));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError('Failed to delete workflow');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      case 'draft':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCompletionRate = (workflow: Workflow) => {
    if (workflow.conversationCount === 0) return '-';
    const rate = Math.round((workflow.completionCount / workflow.conversationCount) * 100);
    return `${rate}%`;
  };

  // Check feature access - AFTER all hooks
  if (authLoading || featureLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  // SuperAdmin always has access, tenants need WABA feature
  if (!isSuperAdmin && !hasFeature("waba")) {
    return (
      <UpgradeRequired 
        featureName="WhatsApp Automation" 
        description="Create automated workflows to handle student inquiries, collect information, and qualify leads automatically. Upgrade to Pro or Enterprise plan to unlock this feature."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">WhatsApp Automation</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage custom workflows for WhatsApp conversations</p>
            </div>
            <Link
              href="/dashboard/whatsapp/automation/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Workflow
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'draft', 'inactive'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filter === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-block">
            <div className="animate-spin">
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Loading workflows...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && workflows.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No workflows yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first WhatsApp automation workflow</p>
            <Link
              href="/dashboard/whatsapp/automation/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Workflow
            </Link>
          </div>
        </div>
      )}

      {/* Workflows Table */}
      {!loading && workflows.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Trigger</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Conversations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Completion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {workflows.map(workflow => (
                    <tr key={workflow._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{workflow.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.linkedPhoneNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{workflow.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{workflow.triggerKeyword}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workflow.status)}`}>
                          {getStatusIcon(workflow.status)}
                          {workflow.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900 dark:text-white">{workflow.conversationCount}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{getCompletionRate(workflow)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === workflow._id ? null : workflow._id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>
                          {openMenu === workflow._id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                              <Link
                                href={`/dashboard/whatsapp/automation/${workflow._id}`}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Link>
                              <Link
                                href={`/dashboard/whatsapp/automation/${workflow._id}?tab=preview`}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                              >
                                <Eye className="w-4 h-4" />
                                Preview
                              </Link>
                              <Link
                                href={`/dashboard/whatsapp/automation/${workflow._id}?tab=analytics`}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                              >
                                <MoreVertical className="w-4 h-4" />
                                Analytics
                              </Link>
                              <button
                                onClick={() => {
                                  setDeleteConfirm(workflow._id);
                                  setOpenMenu(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Workflow?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">This action cannot be undone. The workflow will be marked as inactive.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
