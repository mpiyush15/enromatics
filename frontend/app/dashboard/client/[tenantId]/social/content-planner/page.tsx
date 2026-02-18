'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Clock,
  Eye,
  Send,
  Save,
  Hash,
  ArrowLeft
} from 'lucide-react';

export default function TenantContentPlannerPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contentPosts, setContentPosts] = useState([
    {
      id: 1,
      title: 'New Course Launch',
      content: 'Exciting news! Our new Data Science course is now live. Early bird discount available! #DataScience #OnlineLearning #Education',
      type: 'image',
      platform: ['facebook', 'instagram'],
      scheduledDate: '2024-12-15',
      scheduledTime: '10:00',
      status: 'scheduled',
      hashtags: ['#DataScience', '#OnlineLearning', '#Education']
    },
    {
      id: 2,
      title: 'Student Success Story',
      content: 'Meet Sarah, who landed her dream job after completing our program...',
      type: 'video',
      platform: ['facebook', 'linkedin'],
      scheduledDate: '2024-12-16',
      scheduledTime: '14:30',
      status: 'draft',
      hashtags: ['#SuccessStory', '#StudentSuccess', '#Career']
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'image',
    platform: ['facebook'],
    scheduledDate: selectedDate,
    scheduledTime: '10:00',
    hashtags: []
  });

  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  
  const getPostsForDate = (date: string) => {
    return contentPosts.filter(post => post.scheduledDate === date);
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const postsCount = getPostsForDate(date).length;
      days.push({ day, date, postsCount });
    }
    
    return days;
  };

  const handleCreatePost = () => {
    const newPostWithId = {
      ...newPost,
      id: Date.now(),
      status: 'draft',
      hashtags: newPost.content.match(/#\w+/g) || []
    };
    
    setContentPosts([...contentPosts, newPostWithId]);
    setNewPost({
      title: '',
      content: '',
      type: 'image',
      platform: ['facebook'],
      scheduledDate: selectedDate,
      scheduledTime: '10:00',
      hashtags: []
    });
    setShowCreateModal(false);
  };

  const deletePost = (postId: string | number) => {
    setContentPosts(contentPosts.filter((post: any) => post.id !== postId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'linkedin': return '💼';
      case 'twitter': return '🐦';
      default: return '📱';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/client/${tenantId}/social`}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-light text-gray-900 dark:text-white">📅 Content Planner</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Plan, schedule, and manage your social media content</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Content Calendar - December 2024
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {generateCalendarDays().map((dayObj, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                      ${dayObj ? 'border-gray-200 hover:border-blue-300 dark:border-gray-700' : ''}
                      ${dayObj?.date === selectedDate ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}
                      ${dayObj?.date === getCurrentDate() ? 'ring-2 ring-blue-500' : ''}
                    `}
                    onClick={() => dayObj && setSelectedDate(dayObj.date)}
                  >
                    {dayObj && (
                      <>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {dayObj.day}
                        </div>
                        {dayObj.postsCount > 0 && (
                          <div className="mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {dayObj.postsCount} post{dayObj.postsCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Posts for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Posts for {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getPostsForDate(selectedDate).length > 0 ? (
                  getPostsForDate(selectedDate).map(post => (
                    <div key={post.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                          {post.title}
                        </h4>
                        <div className="flex gap-1">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit className="h-3 w-3" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => deletePost(post.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.scheduledTime}
                        </div>
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-2">
                        {post.platform.map(platform => (
                          <span key={platform} className="text-xs">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No posts scheduled for this date</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setShowCreateModal(true)}
                    >
                      Schedule Post
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>All Scheduled Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contentPosts.map(post => (
                <div key={post.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0">
                    {post.type === 'image' && <ImageIcon className="h-8 w-8 text-blue-600" />}
                    {post.type === 'video' && <Video className="h-8 w-8 text-purple-600" />}
                    {post.type === 'text' && <FileText className="h-8 w-8 text-green-600" />}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{post.title}</h3>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📅 {new Date(post.scheduledDate).toLocaleDateString()}</span>
                      <span>🕐 {post.scheduledTime}</span>
                      <div className="flex items-center gap-1">
                        {post.platform.map(platform => (
                          <span key={platform}>{getPlatformIcon(platform)}</span>
                        ))}
                      </div>
                      {post.hashtags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {post.hashtags.length}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {post.status === 'draft' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Send className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Post Modal - Same as SuperAdmin */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Create New Post</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Post Title
                  </label>
                  <Input
                    placeholder="Enter post title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Content
                  </label>
                  <Textarea
                    placeholder="What's on your mind? Use #hashtags for better reach..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Content Type
                    </label>
                    <select
                      value={newPost.type}
                      onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                    >
                      <option value="image">📷 Image Post</option>
                      <option value="video">🎥 Video Post</option>
                      <option value="text">📝 Text Post</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Platforms
                    </label>
                    <div className="space-y-2">
                      {['facebook', 'instagram', 'linkedin'].map(platform => (
                        <label key={platform} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newPost.platform.includes(platform)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewPost({ ...newPost, platform: [...newPost.platform, platform] });
                              } else {
                                setNewPost({ ...newPost, platform: newPost.platform.filter(p => p !== platform) });
                              }
                            }}
                          />
                          {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Scheduled Date
                    </label>
                    <Input
                      type="date"
                      value={newPost.scheduledDate}
                      onChange={(e) => setNewPost({ ...newPost, scheduledDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Scheduled Time
                    </label>
                    <Input
                      type="time"
                      value={newPost.scheduledTime}
                      onChange={(e) => setNewPost({ ...newPost, scheduledTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!newPost.title || !newPost.content}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}