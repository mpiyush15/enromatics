"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface FacebookPage {
  id: string;
  name: string;
  category: string;
  followers_count: number;
  fan_count: number;
  link: string;
  picture: {
    data: {
      url: string;
    };
  };
}

interface Post {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  updated_time: string;
  type: string;
  link?: string;
  picture?: string;
  full_picture?: string;
  likes?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

export default function SocialPostsPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (connected) {
      fetchPages();
    }
  }, [connected]);

  useEffect(() => {
    if (selectedPage) {
      fetchPosts();
    }
  }, [selectedPage]);

  const checkConnection = async () => {
    try {
      // ✅ Use BFF route instead of direct backend call
      const response = await fetch(`/api/social/status`, {
        credentials: 'include',
      });
      const data = await response.json();
      setConnected(data.connected);
      setLoading(false);
    } catch (err) {
      console.error('Connection check failed:', err);
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      // ✅ Use BFF route instead of direct backend call
      const response = await fetch(`/api/social/pages`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setPages(data.pages);
        if (data.pages.length > 0) {
          setSelectedPage(data.pages[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchPosts = async () => {
    if (!selectedPage) return;
    
    setLoadingPosts(true);
    try {
      // ✅ Use BFF route instead of direct backend call
      const response = await fetch(
        `/api/social/pages/${selectedPage}/posts?limit=20`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  const getEngagementRate = (post: Post) => {
    const likes = post.likes?.summary?.total_count || 0;
    const comments = post.comments?.summary?.total_count || 0;
    const shares = post.shares?.count || 0;
    const totalEngagement = likes + comments + shares;
    
    const selectedPageData = pages.find(page => page.id === selectedPage);
    const followers = selectedPageData?.followers_count || selectedPageData?.fan_count || 1;
    
    return ((totalEngagement / followers) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-3xl font-bold mb-4">Connect Facebook Account</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your Facebook account to view and manage your posts.
          </p>
          <a
            href={`/dashboard/client/${tenantId}/social`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go to Social Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-teal-800 rounded-3xl shadow-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">📝 Social Media Posts</h1>
          <p className="text-green-100">Manage and analyze your Facebook page content</p>
        </div>

        {/* Page Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Facebook Page
              </label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name} ({(page.followers_count || page.fan_count || 0).toLocaleString()} followers)
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchPosts}
              disabled={loadingPosts}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {loadingPosts ? "Refreshing..." : "🔄 Refresh Posts"}
            </button>
          </div>
        </div>

        {/* Page Info */}
        {selectedPage && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              {pages.find(p => p.id === selectedPage)?.picture && (
                <img
                  src={pages.find(p => p.id === selectedPage)?.picture.data.url}
                  alt="Page"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {pages.find(p => p.id === selectedPage)?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {pages.find(p => p.id === selectedPage)?.category}
                </p>
                <p className="text-sm text-blue-600">
                  {(pages.find(p => p.id === selectedPage)?.followers_count || 
                    pages.find(p => p.id === selectedPage)?.fan_count || 0).toLocaleString()} followers
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {loadingPosts ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading posts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.length ? (
              posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Post Image */}
                  {(post.full_picture || post.picture) && (
                    <div className="aspect-video relative">
                      <img
                        src={post.full_picture || post.picture}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                          {post.type}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Post Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(post.created_time).toLocaleDateString()} at{' '}
                        {new Date(post.created_time).toLocaleTimeString()}
                      </p>
                      {post.message && (
                        <p className="text-gray-900 dark:text-white line-clamp-3">
                          {post.message}
                        </p>
                      )}
                      {post.story && !post.message && (
                        <p className="text-gray-600 dark:text-gray-400 italic line-clamp-2">
                          {post.story}
                        </p>
                      )}
                    </div>

                    {/* Engagement Stats */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-600">
                            {post.likes?.summary?.total_count || 0}
                          </div>
                          <div className="text-xs text-gray-600">Likes</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {post.comments?.summary?.total_count || 0}
                          </div>
                          <div className="text-xs text-gray-600">Comments</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">
                            {post.shares?.count || 0}
                          </div>
                          <div className="text-xs text-gray-600">Shares</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <span className="text-sm font-medium text-orange-600">
                          {getEngagementRate(post)}% engagement rate
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex justify-between">
                      {post.link && (
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View on Facebook →
                        </a>
                      )}
                      <span className="text-xs text-gray-500">
                        ID: {post.id.split('_')[1]}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">No Posts Found</h3>
                <p className="text-gray-600">
                  No posts found for this page, or you might need additional permissions.
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">❌ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
