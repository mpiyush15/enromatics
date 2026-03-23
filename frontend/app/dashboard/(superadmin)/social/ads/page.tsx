'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  MessageSquare
} from 'lucide-react';

export default function CreateAdsPage() {
  const [ads, setAds] = useState([
    {
      id: 1,
      title: 'Summer Collection Launch',
      status: 'active',
      platform: 'facebook',
      budget: 5000,
      spent: 3200,
      impressions: 45000,
      clicks: 1200,
      conversions: 85,
      roi: '245%',
      startDate: '2024-06-01',
      endDate: '2024-06-30'
    },
    {
      id: 2,
      title: 'Holiday Promotion',
      status: 'paused',
      platform: 'instagram',
      budget: 3000,
      spent: 1500,
      impressions: 28000,
      clicks: 650,
      conversions: 45,
      roi: '180%',
      startDate: '2024-12-01',
      endDate: '2024-12-25'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">✨ Create Ads</h1>
          <p className="text-gray-600 mt-2">Manage and create advertising campaigns across social platforms</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Ad
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <div className="text-3xl font-bold">₹11,200</div>
              <p className="text-gray-600 text-sm">Total Spent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Eye className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-3xl font-bold">73K</div>
              <p className="text-gray-600 text-sm">Total Impressions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <div className="text-3xl font-bold">1,850</div>
              <p className="text-gray-600 text-sm">Total Clicks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Heart className="w-8 h-8 mx-auto text-red-600 mb-2" />
              <div className="text-3xl font-bold">212%</div>
              <p className="text-gray-600 text-sm">Avg ROI</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ads List */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Recent Ads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Ad Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Platform</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Budget</th>
                  <th className="text-left py-3 px-4 font-semibold">Spent</th>
                  <th className="text-left py-3 px-4 font-semibold">Impressions</th>
                  <th className="text-left py-3 px-4 font-semibold">ROI</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{ad.title}</td>
                    <td className="py-3 px-4 capitalize">{ad.platform}</td>
                    <td className="py-3 px-4">
                      <Badge className={ad.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {ad.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">₹{ad.budget.toLocaleString()}</td>
                    <td className="py-3 px-4">₹{ad.spent.toLocaleString()}</td>
                    <td className="py-3 px-4">{ad.impressions.toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-green-600">{ad.roi}</td>
                    <td className="py-3 px-4">
                      <button className="text-gray-500 hover:text-gray-700">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
