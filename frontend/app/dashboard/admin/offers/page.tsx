'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface Offer {
  _id: string;
  name: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableTo: 'all_plans' | 'specific_plans';
  planIds?: string[];
  maxUsageCount?: number;
  usageCount: number;
  maxUsagePerUser?: number;
  minimumOrderValue?: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
  status: 'draft' | 'active' | 'expired' | 'paused';
}

export default function OffersManagement() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [page, setPage] = useState(1);

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

  // Fetch offers
  useEffect(() => {
    fetchOffers();
  }, [page]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/offers?page=${page}&limit=10`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setOffers(data.offers);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.code || !formData.validFrom || !formData.validUntil) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const method = editingOffer ? 'PUT' : 'POST';
      const endpoint = editingOffer ? `/api/offers/${editingOffer._id}` : '/api/offers';

      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        maxUsageCount: formData.maxUsageCount ? Number(formData.maxUsageCount) : null,
        minimumOrderValue: formData.minimumOrderValue ? Number(formData.minimumOrderValue) : 0,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert(editingOffer ? 'Offer updated!' : 'Offer created!');
        setShowForm(false);
        setEditingOffer(null);
        setFormData({
          name: '',
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: 0,
          maxDiscountAmount: '',
          validFrom: '',
          validUntil: '',
          applicableTo: 'all_plans',
          planIds: [],
          maxUsageCount: '',
          maxUsagePerUser: 1,
          minimumOrderValue: '',
        });
        fetchOffers();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Error saving offer:', err);
      alert('Error saving offer');
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      code: offer.code,
      description: offer.description || '',
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      maxDiscountAmount: offer.maxDiscountAmount?.toString() || '',
      validFrom: offer.validFrom.split('T')[0],
      validUntil: offer.validUntil.split('T')[0],
      applicableTo: offer.applicableTo,
      planIds: offer.planIds || [],
      maxUsageCount: offer.maxUsageCount?.toString() || '',
      maxUsagePerUser: offer.maxUsagePerUser || 1,
      minimumOrderValue: offer.minimumOrderValue?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (data.success) {
        alert('Offer deleted!');
        fetchOffers();
      }
    } catch (err) {
      console.error('Error deleting offer:', err);
      alert('Error deleting offer');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">💰 Offers Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingOffer(null);
            if (!showForm) {
              setFormData({
                name: '',
                code: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                maxDiscountAmount: '',
                validFrom: '',
                validUntil: '',
                applicableTo: 'all_plans',
                planIds: [],
                maxUsageCount: '',
                maxUsagePerUser: 1,
                minimumOrderValue: '',
              });
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Create Offer
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingOffer ? 'Edit Offer' : 'Create New Offer'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Offer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Summer Sale 2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Offer Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., SUMMER25"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                placeholder="Offer description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as 'percentage' | 'flat',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <input
                type="number"
                placeholder="e.g., 20"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Discount (for percentage) */}
            {formData.discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Discount Amount (₹) (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.maxDiscountAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscountAmount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Valid From */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Valid From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Valid Until <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Applicable To */}
            <div>
              <label className="block text-sm font-medium mb-2">Applicable To</label>
              <select
                value={formData.applicableTo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicableTo: e.target.value as 'all_plans' | 'specific_plans',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all_plans">All Plans</option>
                <option value="specific_plans">Specific Plans</option>
              </select>
            </div>

            {/* Minimum Order Value */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Order Value (₹) (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g., 999"
                value={formData.minimumOrderValue}
                onChange={(e) =>
                  setFormData({ ...formData, minimumOrderValue: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Usage Count */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Usage Count (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g., 100"
                value={formData.maxUsageCount}
                onChange={(e) =>
                  setFormData({ ...formData, maxUsageCount: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Usage Per User */}
            <div>
              <label className="block text-sm font-medium mb-2">Max Usage Per User</label>
              <input
                type="number"
                min="1"
                value={formData.maxUsagePerUser}
                onChange={(e) =>
                  setFormData({ ...formData, maxUsagePerUser: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Form Actions */}
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {editingOffer ? 'Update Offer' : 'Create Offer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingOffer(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Offers List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No offers created yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Code</th>
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Discount</th>
                  <th className="px-6 py-3 text-left font-semibold">Valid Till</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Usage</th>
                  <th className="px-6 py-3 text-left font-semibold">Discount Given</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-blue-600">{offer.code}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{offer.name}</p>
                        {offer.description && (
                          <p className="text-sm text-gray-500">{offer.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {offer.discountType === 'percentage'
                        ? `${offer.discountValue}%`
                        : `₹${offer.discountValue}`}
                      {offer.maxDiscountAmount && (
                        <div className="text-xs text-gray-500">
                          Max: ₹{offer.maxDiscountAmount}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(offer.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          offer.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {offer.usageCount}
                      {offer.maxUsageCount && ` / ${offer.maxUsageCount}`}
                    </td>
                    <td className="px-6 py-4 font-medium">₹{offer.totalDiscountGiven}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
