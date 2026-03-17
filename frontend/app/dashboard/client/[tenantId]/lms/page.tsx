'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, FileText, Video, Users, BarChart3, Plus } from 'lucide-react';

export default function LMSPage() {
  const { tenantId } = useParams();

  const lmsModules = [
    {
      title: 'Subjects',
      description: 'Manage subjects and curriculum',
      icon: BookOpen,
      href: `/dashboard/client/${tenantId}/lms/subjects`,
      color: 'bg-blue-500',
      stats: '5 Active',
    },
    {
      title: 'Chapters',
      description: 'Organize chapters within subjects',
      icon: FileText,
      href: `/dashboard/client/${tenantId}/lms/chapters`,
      color: 'bg-purple-500',
      stats: '25 Chapters',
    },
    {
      title: 'Questions',
      description: 'Generate & manage AI questions',
      icon: BarChart3,
      href: `/dashboard/client/${tenantId}/lms/questions`,
      color: 'bg-green-500',
      stats: 'AI Powered',
    },
    {
      title: 'Tests',
      description: 'Create and manage student tests',
      icon: FileText,
      href: `/dashboard/client/${tenantId}/lms/tests`,
      color: 'bg-orange-500',
      stats: '0 Tests',
    },
    {
      title: 'Lessons',
      description: 'Video lessons and study materials',
      icon: Video,
      href: `/dashboard/client/${tenantId}/lms/lessons`,
      color: 'bg-pink-500',
      stats: '0 Lessons',
    },
    {
      title: 'Analytics',
      description: 'Student performance & progress',
      icon: BarChart3,
      href: `/dashboard/client/${tenantId}/lms/student-progress`,
      color: 'bg-indigo-500',
      stats: 'Real-time',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Learning Management System</h1>
              <p className="text-gray-400">Manage subjects, chapters, questions, tests and video lessons</p>
            </div>
            <div className="hidden md:block">
              <BookOpen className="w-16 h-16 text-blue-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Total Subjects</div>
            <div className="text-3xl font-bold text-white">5</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Total Questions</div>
            <div className="text-3xl font-bold text-white">2</div>
            <div className="text-xs text-blue-400 mt-2">🤖 AI Generated</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Active Tests</div>
            <div className="text-3xl font-bold text-white">0</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Lessons</div>
            <div className="text-3xl font-bold text-white">0</div>
          </div>
        </div>

        {/* LMS Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">LMS Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lmsModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20"
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 ${module.color} transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`${module.color} rounded-lg p-3 w-fit mb-4 text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white mb-2">{module.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{module.description}</p>

                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
                        {module.stats}
                      </span>
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-3">Ready to Start?</h3>
          <p className="mb-6 text-blue-100">
            Begin by creating subjects and chapters, then generate AI-powered questions and create tests for your students.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/dashboard/lms/subjects"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Subject
            </Link>
            <Link
              href="/dashboard/lms/questions"
              className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-blue-500"
            >
              Generate Questions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
