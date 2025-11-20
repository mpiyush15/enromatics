"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Award,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  CreditCard,
} from "lucide-react";

interface Registration {
  _id: string;
  registrationNumber: string;
  examId: string;
  studentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  parentEmail?: string;
  address: string | {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  currentClass: string;
  school: string;
  previousMarks?: string;
  photoUrl?: string;
  hasAttended: boolean;
  marksObtained?: number;
  percentage?: number;
  rank?: number;
  result?: "pass" | "fail" | "absent" | "pending";
  rewardEligible: boolean;
  rewardDetails?: {
    rankFrom: number;
    rankTo: number;
    rewardType: string;
    rewardValue: number;
    description: string;
  };
  enrollmentStatus: string;
  convertedToStudent: boolean;
  aadharNumber?: string;
  createdAt: string;
}

interface Exam {
  _id: string;
  examName: string;
  examCode: string;
  totalMarks: number;
  passingMarks: number;
  examDate: string;
  status: string;
}

interface Batch {
  _id: string;
  batchName: string;
  course: string;
  fee: number;
  startDate: string;
  duration: string;
  description?: string;
}

const formatAddress = (address: string | { street: string; city: string; state: string; zipCode: string; country: string }) => {
  if (typeof address === 'string') {
    return address;
  }
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
};

export default function EnrollmentFormPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  const examId = params.examId as string;
  const regId = params.regId as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    selectedBatch: "",
    emergencyContact: "",
    medicalConditions: "",
    transportNeeded: false,
    specialRequirements: "",
    preferredStartDate: "",
    paymentPlan: "full", // full, installment
    parentConsent: false,
    terms: false,
  });

  // Fee calculations
  const [feeAmount, setFeeAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [finalFee, setFinalFee] = useState(0);

  useEffect(() => {
    fetchData();
  }, [regId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://enromatics.com";

      // Fetch exam
      const examResponse = await fetch(`${API_URL}/api/scholarship-exams/${examId}`, {
        credentials: "include",
      });
      if (examResponse.ok) {
        const examData = await examResponse.json();
        setExam(examData.exam);
      }

      // Fetch registration details
      const regResponse = await fetch(`${API_URL}/api/scholarship-exams/${examId}/registrations`, {
        credentials: "include",
      });
      if (regResponse.ok) {
        const regData = await regResponse.json();
        const found = regData.registrations.find((r: Registration) => r._id === regId);
        if (found) {
          setRegistration(found);
          // Pre-fill emergency contact with parent phone
          setFormData(prev => ({
            ...prev,
            emergencyContact: found.parentPhone
          }));
        }
      }

      // Fetch batches
      const batchResponse = await fetch(`${API_URL}/api/batches?tenantId=${tenantId}`, {
        credentials: "include",
      });
      if (batchResponse.ok) {
        const batchData = await batchResponse.json();
        setBatches(batchData.batches || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load enrollment form");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (batchId: string) => {
    setFormData(prev => ({ ...prev, selectedBatch: batchId }));
    const batch = batches.find((b) => b._id === batchId);
    if (batch) {
      const baseFee = batch.fee || 0;
      let discount = 0;

      // Apply scholarship discount if eligible
      if (registration?.rewardEligible && registration?.rewardDetails) {
        const reward = registration.rewardDetails;
        if (reward.rewardType === "percentage") {
          discount = (baseFee * reward.rewardValue) / 100;
        } else if (reward.rewardType === "fixed") {
          discount = reward.rewardValue;
        }
      }

      setFeeAmount(baseFee);
      setDiscountApplied(discount);
      setFinalFee(baseFee - discount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.selectedBatch) {
      alert("Please select a batch");
      return;
    }

    if (!formData.parentConsent) {
      alert("Parent consent is required for enrollment");
      return;
    }

    if (!formData.terms) {
      alert("Please accept the terms and conditions");
      return;
    }

    try {
      setSubmitting(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://enromatics.com";

      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${regId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          batchId: formData.selectedBatch,
          feeAmount: finalFee,
          discountApplied,
          enrollmentData: {
            emergencyContact: formData.emergencyContact,
            medicalConditions: formData.medicalConditions,
            transportNeeded: formData.transportNeeded,
            specialRequirements: formData.specialRequirements,
            preferredStartDate: formData.preferredStartDate,
            paymentPlan: formData.paymentPlan,
          }
        }),
      });

      if (!response.ok) throw new Error("Failed to submit enrollment");

      alert("Enrollment submitted successfully! You will be contacted soon for payment and further details.");
      router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations/${regId}`);
    } catch (error) {
      console.error("Error submitting enrollment:", error);
      alert("Failed to submit enrollment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long", 
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Not Found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations/${regId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Result
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <UserCheck size={32} className="text-green-600" />
                <h1 className="text-3xl font-bold text-gray-900">Student Enrollment Form</h1>
              </div>
              <p className="text-gray-600 mb-4">
                Complete your enrollment for {exam?.examName}
              </p>
              
              {/* Student Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600 font-medium">Student Name</p>
                    <p className="text-blue-900 font-semibold">{registration.studentName}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Registration No.</p>
                    <p className="text-blue-900 font-mono font-semibold">{registration.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Current Class</p>
                    <p className="text-blue-900 font-semibold">{registration.currentClass}</p>
                  </div>
                </div>
              </div>

              {/* Scholarship Info */}
              {registration.rewardEligible && registration.rewardDetails && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-center gap-2 text-purple-900 font-semibold mb-2">
                    <Award size={20} />
                    🎉 Congratulations! You're Eligible for Scholarship
                  </div>
                  <p className="text-purple-700 font-medium">
                    {registration.rewardDetails.description} - {registration.rewardDetails.rewardValue}
                    {registration.rewardDetails.rewardType === "percentage" ? "% discount" : "₹ off"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enrollment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building size={20} />
              Select Your Course & Batch
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Batch <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.selectedBatch}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a batch...</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchName} - {batch.course} | Duration: {batch.duration} | Fee: ₹{(batch.fee || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Batch Details */}
              {formData.selectedBatch && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {(() => {
                    const batch = batches.find(b => b._id === formData.selectedBatch);
                    return batch ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Course</p>
                          <p className="font-semibold">{batch.course}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-semibold">{batch.duration}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-semibold">{formatDate(batch.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Base Fee</p>
                          <p className="font-semibold">₹{(batch.fee || 0).toLocaleString()}</p>
                        </div>
                        {batch.description && (
                          <div className="md:col-span-2">
                            <p className="text-gray-600">Description</p>
                            <p className="font-medium">{batch.description}</p>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Fee Breakdown */}
          {formData.selectedBatch && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Fee Structure
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-600">Base Fee</span>
                  <span className="font-semibold text-gray-900">₹{(feeAmount || 0).toLocaleString()}</span>
                </div>
                
                {discountApplied > 0 && (
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-green-600 flex items-center gap-2">
                      <Award size={16} />
                      Scholarship Discount
                    </span>
                    <span className="font-semibold text-green-600">- ₹{(discountApplied || 0).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Final Fee</span>
                  <span className="text-3xl font-bold text-blue-600">₹{(finalFee || 0).toLocaleString()}</span>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Plan</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentPlan"
                        value="full"
                        checked={formData.paymentPlan === "full"}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentPlan: e.target.value }))}
                        className="mr-2"
                      />
                      <span>Pay Full Amount (₹{(finalFee || 0).toLocaleString()})</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentPlan"
                        value="installment"
                        checked={formData.paymentPlan === "installment"}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentPlan: e.target.value }))}
                        className="mr-2"
                      />
                      <span>Installment Plan (50% now, 50% later)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="Emergency contact number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Start Date
                </label>
                <input
                  type="date"
                  value={formData.preferredStartDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredStartDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions (if any)
                </label>
                <textarea
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalConditions: e.target.value }))}
                  placeholder="Any medical conditions, allergies, or health concerns we should know about..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                  placeholder="Any special requirements, accommodations, or additional information..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.transportNeeded}
                    onChange={(e) => setFormData(prev => ({ ...prev, transportNeeded: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">I need transportation facility</span>
                </label>
              </div>
            </div>
          </div>

          {/* Consent & Terms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Consent & Terms</h3>
            
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.parentConsent}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentConsent: e.target.checked }))}
                  className="mr-2 mt-1"
                  required
                />
                <span className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> I hereby give consent for my child's enrollment in the selected course. 
                  I understand that the enrollment is subject to the terms and conditions of the institute.
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.checked }))}
                  className="mr-2 mt-1"
                  required
                />
                <span className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> I agree to the terms and conditions, fee structure, 
                  and policies of the institute. I understand that fees once paid are non-refundable except in specific circumstances.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.selectedBatch || !formData.parentConsent || !formData.terms}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting Enrollment...
                  </>
                ) : (
                  <>
                    <UserCheck size={20} />
                    Submit Enrollment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}