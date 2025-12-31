'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Send, Eye, TrendingUp, AlertCircle } from 'lucide-react';
import { api, safeApiCall } from '@/lib/apiClient';
import QuestionBuilder from '@/components/automation/QuestionBuilder';

interface Question {
  id: string;
  order: number;
  text: string;
  type: 'text' | 'choice' | 'multiselect';
  options: string[];
  isRequired: boolean;
  isNameField: boolean;
  isMobileField: boolean;
  crmFieldName: string;
  placeholder: string;
  helpText: string;
}

interface Workflow {
  _id: string;
  name: string;
  description: string;
  type: string;
  questions: Question[];
  linkedPhoneNumber: string;
  triggerKeyword: string;
  initialMessage: string;
  completionMessage: string;
  skipMessage: string;
  status: 'active' | 'inactive' | 'draft';
  isPublished: boolean;
  conversationCount: number;
  completionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditWorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = (params?.workflowId as string) || '';
  const tab = (searchParams?.get('tab') || 'edit') as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changed, setChanged] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Fetch workflow
  useEffect(() => {
    fetchWorkflow();
    fetchLinkedPhoneNumber();
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const [data, err] = await safeApiCall(() =>
        api.get<any>(`/api/whatsapp/automation/workflows/${workflowId}`)
      );

      if (err) {
        setError(err.message || 'Failed to load workflow');
        return;
      }

      setWorkflow(data.workflow);
    } catch (err: any) {
      setError('Failed to load workflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkedPhoneNumber = async () => {
    try {
      const [data, err] = await safeApiCall(() =>
        api.get<any>('/api/whatsapp/linked-phone-number')
      );
      if (!err && data?.linkedPhoneNumber && workflow) {
        console.log('✅ Fetched linked phone number:', data.linkedPhoneNumber);
        // Only update if workflow doesn't have one already
        if (!workflow.linkedPhoneNumber) {
          setWorkflow(prev => prev ? { ...prev, linkedPhoneNumber: data.linkedPhoneNumber } : null);
        }
      }
    } catch (error) {
      console.warn('Could not fetch linked phone number:', error);
    }
  };

  const handleUpdate = (updates: Partial<Workflow>) => {
    if (workflow) {
      setWorkflow({ ...workflow, ...updates });
      setChanged(true);
      setSuccess('');
    }
  };

  const handleQuestionsChange = (questions: Question[]) => {
    handleUpdate({
      questions: questions.map((q, idx) => ({ ...q, order: idx })),
    });
  };

  const handleSave = async () => {
    if (!workflow) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const [, err] = await safeApiCall(() =>
        api.put<any>(`/api/whatsapp/automation/workflows/${workflowId}`, workflow)
      );

      if (err) {
        setError(err.message || 'Failed to save workflow');
        return;
      }

      setSuccess('Workflow saved successfully!');
      setChanged(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to save workflow');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!workflow) return;

    try {
      setPublishing(true);
      setError('');

      const [, err] = await safeApiCall(() =>
        api.post<any>(`/api/whatsapp/automation/workflows/${workflowId}/publish`, {})
      );

      if (err) {
        setError(err.message || 'Failed to publish workflow');
        return;
      }

      setWorkflow(prev => prev ? { ...prev, isPublished: true, status: 'active' } : null);
      setSuccess('Workflow published successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to publish workflow');
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Eye className="w-8 h-8 text-orange-500 mx-auto" />
          </div>
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-bold mb-2">Workflow not found</p>
          <p className="text-gray-600 mb-4">The workflow you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/whatsapp/automation"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Back to Workflows
          </Link>
        </div>
      </div>
    );
  }

  const completionRate =
    workflow.conversationCount === 0
      ? '-'
      : `${Math.round((workflow.completionCount / workflow.conversationCount) * 100)}%`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard/whatsapp/automation"
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Workflows
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{workflow.name}</h1>
              <p className="text-gray-600 mt-2">{workflow.description}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                workflow.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : workflow.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {workflow.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <Link
              href={`/dashboard/whatsapp/automation/${workflowId}`}
              className={`py-4 px-2 font-medium transition-colors border-b-2 ${
                tab === 'edit' || !tab
                  ? 'text-orange-600 border-orange-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Edit
            </Link>
            <Link
              href={`/dashboard/whatsapp/automation/${workflowId}?tab=analytics`}
              className={`py-4 px-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                tab === 'analytics'
                  ? 'text-orange-600 border-orange-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        </div>
      )}

      {/* Edit Tab */}
      {(tab === 'edit' || !tab) && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form className="space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Workflow Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={workflow.name}
                    onChange={(e) => handleUpdate({ name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Type
                  </label>
                  <select
                    value={workflow.type}
                    onChange={(e) => handleUpdate({ type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="admission">Admission Inquiry</option>
                    <option value="demo">Demo Request</option>
                    <option value="inquiry">General Inquiry</option>
                    <option value="lead">Lead Generation</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={workflow.description}
                    onChange={(e) => handleUpdate({ description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Business Number
                  </label>
                  <input
                    type="text"
                    value={workflow.linkedPhoneNumber}
                    onChange={(e) => handleUpdate({ linkedPhoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Keyword
                  </label>
                  <input
                    type="text"
                    value={workflow.triggerKeyword}
                    onChange={(e) => handleUpdate({ triggerKeyword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Messages</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Message
                  </label>
                  <textarea
                    value={workflow.initialMessage}
                    onChange={(e) => handleUpdate({ initialMessage: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Message
                  </label>
                  <textarea
                    value={workflow.completionMessage}
                    onChange={(e) => handleUpdate({ completionMessage: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skip Message
                  </label>
                  <textarea
                    value={workflow.skipMessage}
                    onChange={(e) => handleUpdate({ skipMessage: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Questions ({workflow.questions.length})</h2>
              <QuestionBuilder
                questions={workflow.questions}
                onChange={handleQuestionsChange}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {workflow.status !== 'active' && !workflow.isPublished && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing || !changed}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {publishing ? 'Publishing...' : 'Publish Workflow'}
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !changed}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium">Total Conversations</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{workflow.conversationCount}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{workflow.completionCount}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">{completionRate}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium">Abandoned</p>
              <p className="text-4xl font-bold text-red-600 mt-2">
                {workflow.conversationCount - workflow.completionCount}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
