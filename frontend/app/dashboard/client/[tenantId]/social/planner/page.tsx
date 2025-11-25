"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFacebookConnection } from "@/hooks/useFacebookConnection";

const API_BASE_URL = 'https://endearing-blessing-production-c61f.up.railway.app';

export default function ContentPlannerPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const { isConnected, connect } = useFacebookConnection();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">📝</div>
          <h1 className="text-xl font-light text-gray-900 dark:text-white mb-2">
            Connect Facebook First
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">
            You need to connect your Facebook Business account to plan content
          </p>
          <button
            onClick={connect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Connect Facebook
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href={`/dashboard/client/${tenantId}/social`}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"
              >
                ← Back to Social
              </Link>
            </div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Content Planner</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Plan and schedule your social media content</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-4">Content Planner Coming Soon</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-8 max-w-md mx-auto">
            We're working on bringing you powerful content planning and scheduling tools. 
            Stay tuned for updates!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Schedule Posts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                Plan and schedule your Facebook posts in advance
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Content Calendar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                Visual calendar to manage your content strategy
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Media Library</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                Store and organize your images and videos
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={`/dashboard/client/${tenantId}/social/ads`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              ✨ Create Ad Campaign Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}