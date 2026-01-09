"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, Plus, Eye, Trash2, AlertCircle } from 'lucide-react';

interface Template {
  _id: string;
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  status: 'approved' | 'pending' | 'rejected' | 'draft';
  language: string;
  usageCount: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TemplateStats {
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
  total: number;
}

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<TemplateStats>({
    approved: 0,
    pending: 0,
    rejected: 0,
    draft: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/whatsapp/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(data.templates || []);
      
      // Calculate stats
      const stats: TemplateStats = {
        approved: (data.templates || []).filter((t: Template) => t.status === 'approved').length,
        pending: (data.templates || []).filter((t: Template) => t.status === 'pending').length,
        rejected: (data.templates || []).filter((t: Template) => t.status === 'rejected').length,
        draft: (data.templates || []).filter((t: Template) => t.status === 'draft').length,
        total: data.templates?.length || 0,
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSingleTemplate = async (template: Template) => {
    try {
      setSyncing(true);
      // In a real app, you might have an endpoint to sync a single template
      // For now, we'll just show a sync action
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      alert(`✅ Template "${template.name}" synced successfully!`);
    } catch (error) {
      console.error('Error syncing template:', error);
      alert('❌ Failed to sync template');
    } finally {
      setSyncing(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/whatsapp/templates/sync', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Sync failed');
      
      await fetchTemplates();
      alert('✅ Templates synced successfully!');
    } catch (error) {
      console.error('Error syncing templates:', error);
      alert('❌ Failed to sync templates');
    } finally {
      setSyncing(false);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Status color mapping
  const statusColors = {
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  // Category color mapping
  const categoryColors = {
    UTILITY: 'text-blue-600 dark:text-blue-400',
    MARKETING: 'text-purple-600 dark:text-purple-400',
    AUTHENTICATION: 'text-green-600 dark:text-green-400',
  };

  const StatCard = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className={`${color} rounded-lg p-4 text-center`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📱 WhatsApp Templates</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your WhatsApp message templates</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                Sync from WhatsApp
              </button>
              <Link
                href="/dashboard/social/templates/create"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                <Plus size={18} />
                Create Template
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard 
              label="Approved" 
              value={stats.approved}
              icon={<span className="text-2xl">✓</span>}
              color="bg-green-100 dark:bg-green-900/20"
            />
            <StatCard 
              label="Pending" 
              value={stats.pending}
              icon={<span className="text-2xl">⏳</span>}
              color="bg-yellow-100 dark:bg-yellow-900/20"
            />
            <StatCard 
              label="Rejected" 
              value={stats.rejected}
              icon={<span className="text-2xl">✕</span>}
              color="bg-red-100 dark:bg-red-900/20"
            />
            <StatCard 
              label="Draft" 
              value={stats.draft}
              icon={<span className="text-2xl">📝</span>}
              color="bg-gray-100 dark:bg-gray-700"
            />
            <StatCard 
              label="Total" 
              value={stats.total}
              icon={<span className="text-2xl">📊</span>}
              color="bg-blue-100 dark:bg-blue-900/20"
            />
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 dark:text-gray-400">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p>Loading templates...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <AlertCircle className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400">No templates found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Template Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTemplates.map((template) => (
                    <tr 
                      key={template._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${categoryColors[template.category]}`}>
                          {template.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[template.status]}`}>
                          {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {template.language}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {template.usageCount} times
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowPreview(true);
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results info */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredTemplates.length} of {templates.length} templates
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedTemplate.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Template ID: {selectedTemplate._id}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusColors[selectedTemplate.status]}`}>
                {selectedTemplate.status.charAt(0).toUpperCase() + selectedTemplate.status.slice(1)}
              </span>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300`}>
                {selectedTemplate.category}
              </span>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300`}>
                {selectedTemplate.language}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Usage Count</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTemplate.usageCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">times used</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Created</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedTemplate.createdAt ? new Date(selectedTemplate.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Template Content Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Template Content</h3>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed font-medium">
                  {selectedTemplate.content}
                </p>
              </div>
            </div>

            {/* Message Preview Card */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">WhatsApp Message Preview</h3>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💬</div>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg rounded-tl-none shadow-sm">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedTemplate.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Close
              </button>
              <button
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
