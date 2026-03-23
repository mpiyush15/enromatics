'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function CreateOfferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    applicableTo: 'all_plans',
    planIds: [] as string[],
    maxUsageCount: '',
    maxUsagePerUser: 1,
    minimumOrderValue: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.code || !formData.validFrom || !formData.validUntil) {
      alert('Please fill all required fields');
      return;
    }

    if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      alert('Valid From must be before Valid Until');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        maxUsageCount: formData.maxUsageCount ? Number(formData.maxUsageCount) : null,
        minimumOrderValue: formData.minimumOrderValue ? Number(formData.minimumOrderValue) : 0,
      };

      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (data.success) {
        alert('Offer created successfully!');
        router.push('/dashboard/admin/offers');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      alert('Error creating offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">➕ Create New Offer</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Set up a new promotional offer for your pricing plans</p>
      </div>

      {/* Create Form */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Offer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Summer Sale 2025"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Offer Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., SUMMER25"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 uppercase"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              placeholder="Offer description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Discount Type</label>
            <select
              value={formData.discountType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountType: e.target.value as 'percentage' | 'flat',
                })
              }
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
            </label>
            <input
              type="number"
              placeholder="e.g., 20"
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({ ...formData, discountValue: Number(e.target.value) })
              }
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          {/* Max Discount (for percentage) */}
          {formData.discountType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Max Discount Amount (₹) <span className="text-slate-500 dark:text-slate-400">(Optional)</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 5000"
                value={formData.maxDiscountAmount}
                onChange={(e) =>
                  setFormData({ ...formData, maxDiscountAmount: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          )}

          {/* Valid From */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Valid From <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Valid Until <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          {/* Applicable To */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Applicable To</label>
            <select
              value={formData.applicableTo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  applicableTo: e.target.value as 'all_plans' | 'specific_plans',
                })
              }
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all_plans">All Plans</option>
              <option value="specific_plans">Specific Plans</option>
            </select>
          </div>

          {/* Minimum Order Value */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Minimum Order Value (₹) <span className="text-slate-500 dark:text-slate-400">(Optional)</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 999"
              value={formData.minimumOrderValue}
              onChange={(e) =>
                setFormData({ ...formData, minimumOrderValue: e.target.value })
              }
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {/* Max Usage Count */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Max Usage Count <span className="text-slate-500 dark:text-slate-400">(Optional)</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 100"
              value={formData.maxUsageCount}
              onChange={(e) =>
                setFormData({ ...formData, maxUsageCount: e.target.value })
              }
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {/* Max Usage Per User */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Max Usage Per User</label>
            <input
              type="number"
              min="1"
              value={formData.maxUsagePerUser}
              onChange={(e) =>
                setFormData({ ...formData, maxUsagePerUser: Number(e.target.value) })
              }
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {/* Form Actions */}
          <div className="md:col-span-2 flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Offer'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-400 dark:hover:bg-slate-600 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
