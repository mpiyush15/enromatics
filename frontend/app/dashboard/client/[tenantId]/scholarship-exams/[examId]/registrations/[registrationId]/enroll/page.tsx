"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  CreditCard,
  CheckCircle,
  Award,
  BookOpen,
  Users,
  Clock,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://enromatics.com";

interface Registration {
  _id: string;
  registrationNumber: string;
  studentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  currentClass: string;
  school: string;
  address: string | {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
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
  createdAt: string;
}

interface Batch {
  _id: string;
  batchName: string;
  course: string;
  fee: number;
  schedule: string;
  startDate: string;
  duration: string;
  capacity: number;
  enrolled: number;
}

interface Exam {
  _id: string;
  examName: string;
  examCode: string;
  examDate: string;
}

export default function EnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  const examId = params.examId as string;
  const registrationId = params.registrationId as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state - matching registration form fields
  const [selectedBatch, setSelectedBatch] = useState("");
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [currentClass, setCurrentClass] = useState("");
  const [school, setSchool] = useState("");
  const [address, setAddress] = useState("");
  const [previousMarks, setPreviousMarks] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalFee, setFinalFee] = useState(0);
  const [baseFee, setBaseFee] = useState(0);

  useEffect(() => {
    fetchData();
  }, [registrationId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch registration details
      const regResponse = await fetch(`${API_URL}/api/scholarship-exams/${examId}/registrations`, {
        credentials: "include",
      });
      
      if (regResponse.ok) {
        const regData = await regResponse.json();
        const foundRegistration = regData.registrations?.find((r: Registration) => r._id === registrationId);
        
        if (foundRegistration) {
          setRegistration(foundRegistration);
          // Pre-fill form with registration data
          setStudentName(foundRegistration.studentName);
          setEmail(foundRegistration.email);
          setPhone(foundRegistration.phone);
          setDateOfBirth(foundRegistration.dateOfBirth ? foundRegistration.dateOfBirth.split('T')[0] : "");
          setGender(foundRegistration.gender || "");
          setFatherName(foundRegistration.fatherName || "");
          setMotherName(foundRegistration.motherName || "");
          setParentPhone(foundRegistration.parentPhone || "");
          setCurrentClass(foundRegistration.currentClass || "");
          setSchool(foundRegistration.school || "");
          setAddress(typeof foundRegistration.address === 'string' 
            ? foundRegistration.address 
            : `${foundRegistration.address?.street || ""}, ${foundRegistration.address?.city || ""}, ${foundRegistration.address?.state || ""} ${foundRegistration.address?.zipCode || ""}`
          );
          setPreviousMarks(foundRegistration.previousMarks || "");
        }
      }

      // Fetch exam details
      const examResponse = await fetch(`${API_URL}/api/scholarship-exams/${examId}`, {
        credentials: "include",
      });
      if (examResponse.ok) {
        const examData = await examResponse.json();
        setExam(examData.exam);
      }

      // Fetch available batches
      const batchResponse = await fetch(`${API_URL}/api/batches?tenantId=${tenantId}`, {
        credentials: "include",
      });
      if (batchResponse.ok) {
        const batchData = await batchResponse.json();
        setBatches(batchData.batches || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load enrollment data");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (batchId: string) => {
    setSelectedBatch(batchId);
    const batch = batches.find((b) => b._id === batchId);
    if (batch && registration) {
      const fee = batch.fee || 0;
      let calculatedDiscount = 0;

      // Apply scholarship discount if eligible
      if (registration.rewardEligible && registration.rewardDetails) {
        const reward = registration.rewardDetails;
        if (reward.rewardType === "percentage") {
          calculatedDiscount = (fee * reward.rewardValue) / 100;
        } else if (reward.rewardType === "fixed") {
          calculatedDiscount = reward.rewardValue;
        }
      }

      setBaseFee(fee);
      setDiscount(calculatedDiscount);
      setFinalFee(fee - calculatedDiscount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBatch) {
      alert("Please select a batch");
      return;
    }

    if (!confirm(`Enroll ${studentName} in the selected batch?`)) {
      return;
    }

    try {
      setSubmitting(true);

      const enrollmentData = {
        batchId: selectedBatch,
        studentName,
        email,
        phone,
        dateOfBirth,
        gender,
        fatherName,
        motherName,
        parentPhone,
        currentClass,
        school,
        address,
        previousMarks,
        feeAmount: finalFee,
        discountApplied: discount,
        scholarshipExamId: examId,
        registrationId: registrationId,
      };

      const response = await fetch(`${API_URL}/api/scholarship-exams/registration/${registrationId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(enrollmentData),
      });

      if (!response.ok) {
        throw new Error("Failed to enroll student");
      }

      alert("Student enrolled successfully!");
      router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations`);
    } catch (error) {
      console.error("Error enrolling student:", error);
      alert("Failed to enroll student. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatAddress = (address: string | { street: string; city: string; state: string; zipCode: string; country: string }) => {
    if (typeof address === 'string') {
      return address;
    }
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Not Found</h2>
          <p className="text-gray-600 mb-4">The registration you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations`)}
            className="text-blue-600 hover:text-blue-800"
          >
            Go back to registrations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Registrations
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <GraduationCap className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Enrollment</h1>
              <p className="text-gray-600">Convert scholarship exam registration to full student admission</p>
            </div>
          </div>

          {/* Student Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-600 font-medium">Student Name</p>
                <p className="text-blue-900 font-semibold">{registration.studentName}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Registration Number</p>
                <p className="text-blue-900 font-mono font-semibold">{registration.registrationNumber}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Exam</p>
                <p className="text-blue-900 font-semibold">{exam?.examName}</p>
              </div>
              {registration.marksObtained !== undefined && (
                <>
                  <div>
                    <p className="text-blue-600 font-medium">Marks</p>
                    <p className="text-blue-900 font-semibold">
                      {registration.marksObtained} • Rank {registration.rank}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Result</p>
                    <p className="text-blue-900 font-semibold uppercase">{registration.result}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Percentage</p>
                    <p className="text-blue-900 font-semibold">{registration.percentage?.toFixed(1)}%</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Scholarship Info */}
          {registration.rewardEligible && registration.rewardDetails && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-purple-900 font-semibold mb-2">
                <Award size={20} />
                Scholarship Reward Eligible
              </div>
              <p className="text-purple-700 font-medium">
                {registration.rewardDetails.description} - {registration.rewardDetails.rewardValue}
                {registration.rewardDetails.rewardType === "percentage" ? "%" : "₹"} discount will be applied
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="text-gray-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Class
              </label>
              <input
                type="text"
                value={currentClass}
                onChange={(e) => setCurrentClass(e.target.value)}
                placeholder="e.g., Class 10, Class 12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Parent Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-gray-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Parent Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Father's Name
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mother's Name
              </label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Phone Number
              </label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="text-gray-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Academic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Academic Marks
              </label>
              <input
                type="text"
                value={previousMarks}
                onChange={(e) => setPreviousMarks(e.target.value)}
                placeholder="e.g., 95% in 10th grade"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Batch Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="text-gray-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Batch Selection</h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Batch <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => handleBatchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a batch...</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.batchName} - {batch.course} (₹{batch.fee?.toLocaleString() || 0}) - {batch.enrolled || 0}/{batch.capacity || 0} students
                </option>
              ))}
            </select>
          </div>

          {selectedBatch && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Selected Batch Details</h3>
              {(() => {
                const batch = batches.find(b => b._id === selectedBatch);
                if (!batch) return null;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Course</p>
                      <p className="font-medium">{batch.course}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Schedule</p>
                      <p className="font-medium">{batch.schedule}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-medium">{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'TBD'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium">{batch.duration}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Fee Structure */}
        {selectedBatch && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="text-gray-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Fee Structure</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Fee</span>
                <span className="font-semibold text-gray-900">₹{baseFee.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Scholarship Discount</span>
                  <span className="font-semibold text-green-600">- ₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-300 flex justify-between">
                <span className="font-semibold text-gray-900">Final Fee</span>
                <span className="text-2xl font-bold text-blue-600">₹{finalFee.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/client/${tenantId}/scholarship-exams/${examId}/registrations`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedBatch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Enrolling...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Enroll Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}