'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, Eye } from 'lucide-react';
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

interface WorkflowFormData {
  name: string;
  description: string;
  type: 'admission' | 'demo' | 'inquiry' | 'lead' | 'custom';
  questions: Question[];
  linkedPhoneNumber: string;
  triggerKeyword: string;
  initialMessage: string;
  completionMessage: string;
  skipMessage: string;
}

export default function CreateWorkflowPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [formData, setFormData] = useState<WorkflowFormData>({
    name: '',
    description: '',
    type: 'admission',
    questions: [
      {
        id: 'q_name',
        order: 0,
        text: "What's your full name?",
        type: 'text',
        options: [],
        isRequired: true,
        isNameField: true,
        isMobileField: false,
        crmFieldName: 'name',
        placeholder: 'Enter your full name',
        helpText: '',
      },
      {
        id: 'q_mobile',
        order: 1,
        text: "What's your mobile number?",
        type: 'text',
        options: [],
        isRequired: true,
        isNameField: false,
        isMobileField: true,
        crmFieldName: 'phone',
        placeholder: 'Enter your mobile number',
        helpText: '',
      },
    ],
    linkedPhoneNumber: '',
    triggerKeyword: '',
    initialMessage: 'Hi! I have some quick questions for you.',
    completionMessage: 'Thank you! Someone from our team will contact you soon.',
    skipMessage: "You've skipped the workflow.",
  });

  // Fetch linked phone number when component mounts
  useEffect(() => {
    const fetchLinkedPhoneNumber = async () => {
      try {
        const [data, err] = await safeApiCall(() => 
          api.get<any>('/api/whatsapp/linked-phone-number')
        );
        if (!err && data) {
          // Use linkedPhoneNumber if available, otherwise fall back to phoneNumberId
          const phoneNumber = data.linkedPhoneNumber || data.phoneNumberId;
          if (phoneNumber) {
            console.log('✅ Fetched linked phone number:', phoneNumber);
            setFormData(prev => ({
              ...prev,
              linkedPhoneNumber: phoneNumber,
            }));
          }
        } else {
          console.warn('⚠️ Could not fetch phone number:', err?.message);
          // It's okay if phone number fetch fails - user can enter it manually
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch linked phone number:', error);
        // Silently fail - phone number will be filled in manually by user
      }
    };
    
    // Wait a bit for auth to be fully established before fetching phone number
    const timer = setTimeout(() => {
      fetchLinkedPhoneNumber();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionsChange = (questions: Question[]) => {
    setFormData(prev => ({
      ...prev,
      questions: questions.map((q, idx) => ({ ...q, order: idx })),
    }));
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      order: formData.questions.length,
      text: '',
      type: 'text',
      options: [],
      isRequired: true,
      isNameField: false,
      isMobileField: false,
      crmFieldName: '',
      placeholder: '',
      helpText: '',
    };
    handleQuestionsChange([...formData.questions, newQuestion]);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Workflow name is required');
      return false;
    }
    if (!formData.linkedPhoneNumber.trim()) {
      setError('WhatsApp business number is required');
      return false;
    }
    if (!formData.triggerKeyword.trim()) {
      setError('Trigger keyword is required');
      return false;
    }
    if (formData.questions.length < 2) {
      setError('At least 2 questions are required (name + mobile)');
      return false;
    }

    const hasNameField = formData.questions.some(q => q.isNameField);
    const hasMobileField = formData.questions.some(q => q.isMobileField);
    if (!hasNameField || !hasMobileField) {
      setError('Workflow must have name and mobile fields');
      return false;
    }

    const allQuestionsHaveText = formData.questions.every(q => q.text.trim());
    if (!allQuestionsHaveText) {
      setError('All questions must have text');
      return false;
    }

    return true;
  };

  const handleSubmit = async (publishNow: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        ...formData,
        status: publishNow ? 'active' : 'draft',
        isPublished: publishNow,
      };

      const [data, err] = await safeApiCall(() =>
        api.post<any>('/api/whatsapp/automation/workflows', payload)
      );

      if (err) {
        setError(err.message || 'Failed to create workflow');
        return;
      }

      router.push(`/dashboard/whatsapp/automation/${data.workflow._id}`);
    } catch (err: any) {
      setError('Failed to create workflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (preview) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Preview Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => setPreview(false)}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Editor
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Preview Workflow</h2>
          </div>
        </div>

        {/* Preview Container */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
            {/* Conversation Bubble - Initial Message */}
            <div className="p-6 border-b border-gray-200">
              <div className="bg-gray-100 rounded-lg p-4 w-fit max-w-xs">
                <p className="text-gray-800 text-sm">{formData.initialMessage}</p>
                <p className="text-gray-500 text-xs mt-2">Just now</p>
              </div>
            </div>

            {/* Question Preview */}
            <div className="p-6">
              {currentQuestionIndex < formData.questions.length ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 w-fit max-w-xs">
                    <p className="text-gray-800 text-sm font-medium">
                      {formData.questions[currentQuestionIndex].text}
                    </p>
                    {formData.questions[currentQuestionIndex].helpText && (
                      <p className="text-gray-600 text-xs mt-2">
                        {formData.questions[currentQuestionIndex].helpText}
                      </p>
                    )}
                  </div>

                  {/* Render Question Type */}
                  {formData.questions[currentQuestionIndex].type === 'text' && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder={formData.questions[currentQuestionIndex].placeholder || 'Type your answer...'}
                        className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled
                      />
                    </div>
                  )}

                  {formData.questions[currentQuestionIndex].type === 'choice' && (
                    <div className="mt-4 space-y-2 max-w-xs">
                      {formData.questions[currentQuestionIndex].options.map((option, idx) => (
                        <label key={idx} className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name="choice" className="w-4 h-4" disabled />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {formData.questions[currentQuestionIndex].type === 'multiselect' && (
                    <div className="mt-4 space-y-2 max-w-xs">
                      {formData.questions[currentQuestionIndex].options.map((option, idx) => (
                        <label key={idx} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4" disabled />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Next Button */}
                  <div className="flex gap-2 mt-6">
                    {currentQuestionIndex > 0 && (
                      <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Previous
                      </button>
                    )}
                    {currentQuestionIndex < formData.questions.length - 1 && (
                      <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 w-fit max-w-xs">
                    <p className="text-gray-800 text-sm">{formData.completionMessage}</p>
                  </div>
                  <button
                    onClick={() => setCurrentQuestionIndex(0)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Restart
                  </button>
                </div>
              )}

              {/* Progress */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">
                  Question {Math.min(currentQuestionIndex + 1, formData.questions.length)} of {formData.questions.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${((Math.min(currentQuestionIndex + 1, formData.questions.length)) / formData.questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard/whatsapp/automation"
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Workflows
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Workflow</h1>
          <p className="text-gray-600 mt-2">Set up a custom WhatsApp automation workflow with your questions</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Workflow Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Admission Inquiry, Demo Request"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
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
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of this workflow"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Business Number *
                </label>
                <input
                  type="text"
                  name="linkedPhoneNumber"
                  value={formData.linkedPhoneNumber}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Keyword *
                </label>
                <input
                  type="text"
                  name="triggerKeyword"
                  value={formData.triggerKeyword}
                  onChange={handleInputChange}
                  placeholder="e.g., hi, demo, admission"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">User types this to start the workflow</p>
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
                  name="initialMessage"
                  value={formData.initialMessage}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Message
                </label>
                <textarea
                  name="completionMessage"
                  value={formData.completionMessage}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skip Message (Optional)
                </label>
                <textarea
                  name="skipMessage"
                  value={formData.skipMessage}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Questions ({formData.questions.length})</h2>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>

            <QuestionBuilder
              questions={formData.questions}
              onChange={handleQuestionsChange}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
