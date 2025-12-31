'use client';

import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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

interface QuestionBuilderProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

export default function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  const [expandedId, setExpandedId] = useState<string | null>(questions[0]?.id || null);
  const [newOption, setNewOption] = useState<{ [key: string]: string }>({});

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const updated = questions.map(q => (q.id === id ? { ...q, ...updates } : q));
    onChange(updated);
  };

  const deleteQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) {
      return;
    }

    const newQuestions = [...questions];
    if (direction === 'up') {
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    } else {
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    }
    onChange(newQuestions);
  };

  const addOption = (questionId: string) => {
    const optionText = newOption[questionId] || '';
    if (!optionText.trim()) return;

    const question = questions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: [...question.options, optionText],
      });
      setNewOption(prev => ({ ...prev, [questionId]: '' }));
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: question.options.filter((_, i) => i !== optionIndex),
      });
    }
  };

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={question.id} className="border border-gray-200 rounded-lg">
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => setExpandedId(expandedId === question.id ? null : question.id)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 w-6">Q{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{question.text || 'Untitled Question'}</p>
                  <p className="text-xs text-gray-500">
                    {question.type === 'text' && 'Text Input'}
                    {question.type === 'choice' && `Multiple Choice (${question.options.length} options)`}
                    {question.type === 'multiselect' && `Multi-select (${question.options.length} options)`}
                    {question.isNameField && ' • Name Field'}
                    {question.isMobileField && ' • Mobile Field'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveQuestion(question.id, 'up');
                }}
                disabled={index === 0}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveQuestion(question.id, 'down');
                }}
                disabled={index === questions.length - 1}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteQuestion(question.id);
                }}
                className="p-1 hover:bg-red-100 text-red-600 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          {expandedId === question.id && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                  placeholder="What would you like to ask?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Question Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type *
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        type: e.target.value as 'text' | 'choice' | 'multiselect',
                        options: e.target.value === 'text' ? [] : question.options,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="text">Text Input</option>
                    <option value="choice">Multiple Choice</option>
                    <option value="multiselect">Multi-select</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.isRequired}
                      onChange={(e) => updateQuestion(question.id, { isRequired: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Required</span>
                  </label>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.isNameField}
                      onChange={(e) => updateQuestion(question.id, { isNameField: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Name Field</span>
                  </label>
                </div>
              </div>

              {/* Mobile Field */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={question.isMobileField}
                    onChange={(e) => updateQuestion(question.id, { isMobileField: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Mobile Number Field</span>
                </label>
              </div>

              {/* Question Options (for choice/multiselect) */}
              {(question.type === 'choice' || question.type === 'multiselect') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Options *
                  </label>
                  <div className="space-y-3 mb-4">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options];
                            newOptions[optionIndex] = e.target.value;
                            updateQuestion(question.id, { options: newOptions });
                          }}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(question.id, optionIndex)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOption[question.id] || ''}
                      onChange={(e) => setNewOption(prev => ({ ...prev, [question.id]: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addOption(question.id);
                        }
                      }}
                      placeholder="Add new option..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => addOption(question.id)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Placeholder & Help Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={question.placeholder}
                    onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                    placeholder="Enter placeholder text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CRM Field Name
                  </label>
                  <input
                    type="text"
                    value={question.crmFieldName}
                    onChange={(e) => updateQuestion(question.id, { crmFieldName: e.target.value })}
                    placeholder="e.g., courseInterest, budget"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Help Text (Optional)
                </label>
                <input
                  type="text"
                  value={question.helpText}
                  onChange={(e) => updateQuestion(question.id, { helpText: e.target.value })}
                  placeholder="Additional guidance for the user"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
