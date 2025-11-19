"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, Eye } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface Reward {
  rankFrom: number;
  rankTo: number;
  rewardType: "percentage" | "fixed" | "certificate";
  rewardValue: number;
  description: string;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface LandingPage {
  heroTitle: string;
  heroSubtitle: string;
  aboutExam: string;
  syllabus: string;
  importantDates: string;
  primaryColor: string;
  secondaryColor: string;
}

interface ExamData {
  _id: string;
  examName: string;
  examCode: string;
  description: string;
  registrationStartDate: string;
  registrationEndDate: string;
  examDate: string;
  examDates: string[];
  resultDate: string;
  examDuration: number;
  totalMarks: number;
  passingMarks: number;
  examMode: "online" | "offline" | "hybrid";
  venue: string;
  registrationFee: {
    amount: number;
    paymentRequired: boolean;
  };
  eligibilityCriteria: {
    minAge: number;
    maxAge: number;
    eligibleClasses: string[];
    qualification: string;
  };
  landingPage: LandingPage;
  rewards: Reward[];
  formFields: {
    collectPhoto: boolean;
    collectAadhar: boolean;
    collectPreviousMarks: boolean;
    customFields: FormField[];
  };
  status: string;
}

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  const examId = params.examId as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<"basic" | "landing" | "rewards" | "form">("basic");

  // Form states
  const [examName, setExamName] = useState("");
  const [description, setDescription] = useState("");
  const [registrationStartDate, setRegistrationStartDate] = useState("");
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [examDates, setExamDates] = useState<string[]>([""]);
  const [resultDate, setResultDate] = useState("");
  const [examDuration, setExamDuration] = useState(180);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [examMode, setExamMode] = useState<"online" | "offline" | "hybrid">("offline");
  const [venue, setVenue] = useState("");
  const [registrationFee, setRegistrationFee] = useState(0);

  // Eligibility
  const [minAge, setMinAge] = useState(10);
  const [maxAge, setMaxAge] = useState(18);
  const [eligibleClasses, setEligibleClasses] = useState<string[]>([]);
  const [qualification, setQualification] = useState("");

  // Landing Page
  const [landingPage, setLandingPage] = useState<LandingPage>({
    heroTitle: "Join Our Scholarship Entrance Exam",
    heroSubtitle: "Unlock your potential and win amazing scholarships",
    aboutExam: "",
    syllabus: "",
    importantDates: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
  });

  // Rewards
  const [rewards, setRewards] = useState<Reward[]>([
    { rankFrom: 1, rankTo: 1, rewardType: "percentage", rewardValue: 100, description: "100% Scholarship" },
  ]);

  // Form Fields
  const [customFields, setCustomFields] = useState<FormField[]>([]);

  // Load existing exam data
  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`${API_URL}/api/scholarship-exams/${examId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch exam data");

      const data = await response.json();
      const exam: ExamData = data.exam;

      // Populate form fields
      setExamName(exam.examName || "");
      setDescription(exam.description || "");
      setRegistrationStartDate(exam.registrationStartDate ? new Date(exam.registrationStartDate).toISOString().split('T')[0] : "");
      setRegistrationEndDate(exam.registrationEndDate ? new Date(exam.registrationEndDate).toISOString().split('T')[0] : "");
      setExamDates(exam.examDates?.length > 0 ? exam.examDates.map(date => new Date(date).toISOString().split('T')[0]) : [new Date(exam.examDate).toISOString().split('T')[0]]);
      setResultDate(exam.resultDate ? new Date(exam.resultDate).toISOString().split('T')[0] : "");
      setExamDuration(exam.examDuration || 180);
      setTotalMarks(exam.totalMarks || 100);
      setPassingMarks(exam.passingMarks || 40);
      setExamMode(exam.examMode || "offline");
      setVenue(exam.venue || "");
      setRegistrationFee(exam.registrationFee?.amount || 0);

      // Eligibility
      setMinAge(exam.eligibilityCriteria?.minAge || 10);
      setMaxAge(exam.eligibilityCriteria?.maxAge || 18);
      setEligibleClasses(exam.eligibilityCriteria?.eligibleClasses || []);
      setQualification(exam.eligibilityCriteria?.qualification || "");

      // Landing page
      setLandingPage({
        heroTitle: exam.landingPage?.heroTitle || "Join Our Scholarship Entrance Exam",
        heroSubtitle: exam.landingPage?.heroSubtitle || "Unlock your potential and win amazing scholarships",
        aboutExam: exam.landingPage?.aboutExam || "",
        syllabus: exam.landingPage?.syllabus || "",
        importantDates: exam.landingPage?.importantDates || "",
        primaryColor: exam.landingPage?.primaryColor || "#3B82F6",
        secondaryColor: exam.landingPage?.secondaryColor || "#10B981",
      });

      // Rewards
      setRewards(exam.rewards || []);

      // Custom fields
      setCustomFields(exam.formFields?.customFields || []);

    } catch (error) {
      console.error("Error fetching exam data:", error);
      alert("Failed to load exam data");
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const addExamDate = () => {
    setExamDates([...examDates, ""]);
  };

  const removeExamDate = (index: number) => {
    if (examDates.length > 1) {
      setExamDates(examDates.filter((_, i) => i !== index));
    }
  };

  const updateExamDate = (index: number, value: string) => {
    const updated = [...examDates];
    updated[index] = value;
    setExamDates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty dates
      const validExamDates = examDates.filter(date => date.trim() !== "");
      
      if (validExamDates.length === 0) {
        alert("Please add at least one exam date");
        setLoading(false);
        return;
      }

      const examData = {
        examName,
        description,
        registrationStartDate,
        registrationEndDate,
        examDates: validExamDates,
        examDate: validExamDates[0], // Keep first date as primary for backward compatibility
        resultDate,
        examDuration,
        totalMarks,
        passingMarks,
        examMode,
        venue,
        registrationFee: {
          amount: registrationFee,
          paymentRequired: registrationFee > 0,
        },
        eligibilityCriteria: {
          minAge,
          maxAge,
          eligibleClasses,
          qualification,
        },
        landingPage,
        rewards,
        formFields: {
          collectPhoto: true,
          collectAadhar: false,
          collectPreviousMarks: true,
          customFields: customFields.map(field => ({
            fieldName: field.name,
            fieldType: field.type,
            required: field.required,
            options: field.options || [],
          })),
        },
      };

      console.log("🔄 Updating exam with data:", examData);
      
      const response = await fetch(`${API_URL}/api/scholarship-exams/${examId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update exam");
      }

      const data = await response.json();
      alert(`Exam updated successfully!`);
      router.push(`/dashboard/client/${tenantId}/scholarship-exams`);
    } catch (error: any) {
      console.error("Error updating exam:", error);
      alert(error.message || "Failed to update exam");
    } finally {
      setLoading(false);
    }
  };

  const addReward = () => {
    setRewards([
      ...rewards,
      { rankFrom: 2, rankTo: 5, rewardType: "percentage", rewardValue: 50, description: "50% Scholarship" },
    ]);
  };

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const updateReward = (index: number, field: keyof Reward, value: any) => {
    const updated = [...rewards];
    updated[index] = { ...updated[index], [field]: value };
    setRewards(updated);
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { name: `custom_${Date.now()}`, label: "Custom Field", type: "text", required: false },
    ]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: keyof FormField, value: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: value };
    setCustomFields(updated);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Scholarship Exam</h1>
            <p className="text-gray-600">Update exam details and configuration</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "basic", label: "Basic Details" },
              { id: "landing", label: "Landing Page" },
              { id: "rewards", label: "Rewards" },
              { id: "form", label: "Form Fields" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Details Tab */}
          {currentTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Name *</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Science Scholarship Test 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Mode</label>
                  <select
                    value={examMode}
                    onChange={(e) => setExamMode(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the scholarship exam"
                />
              </div>

              {/* Exam Dates */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Exam Dates *</label>
                  <button
                    type="button"
                    onClick={addExamDate}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Add Date
                  </button>
                </div>
                <div className="space-y-3">
                  {examDates.map((date, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => updateExamDate(index, e.target.value)}
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {examDates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExamDate(index)}
                          className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Start Date *</label>
                  <input
                    type="date"
                    value={registrationStartDate}
                    onChange={(e) => setRegistrationStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration End Date *</label>
                  <input
                    type="date"
                    value={registrationEndDate}
                    onChange={(e) => setRegistrationEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Result Date</label>
                <input
                  type="date"
                  value={resultDate}
                  onChange={(e) => setResultDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Exam Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    min={30}
                    max={480}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passing Marks</label>
                  <input
                    type="number"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                    min={1}
                    max={totalMarks}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {examMode !== "online" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Exam venue address"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee (₹)</label>
                <input
                  type="number"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0 for free registration"
                />
              </div>

              {/* Eligibility Criteria */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Eligibility Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Age</label>
                    <input
                      type="number"
                      value={minAge}
                      onChange={(e) => setMinAge(Number(e.target.value))}
                      min={5}
                      max={25}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Age</label>
                    <input
                      type="number"
                      value={maxAge}
                      onChange={(e) => setMaxAge(Number(e.target.value))}
                      min={minAge}
                      max={30}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualification Requirements</label>
                  <textarea
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Completed 10th grade or equivalent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Landing Page Tab */}
          {currentTab === "landing" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={landingPage.heroTitle}
                  onChange={(e) => setLandingPage({ ...landingPage, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                <input
                  type="text"
                  value={landingPage.heroSubtitle}
                  onChange={(e) => setLandingPage({ ...landingPage, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Exam</label>
                <textarea
                  value={landingPage.aboutExam}
                  onChange={(e) => setLandingPage({ ...landingPage, aboutExam: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus</label>
                <textarea
                  value={landingPage.syllabus}
                  onChange={(e) => setLandingPage({ ...landingPage, syllabus: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Important Dates</label>
                <textarea
                  value={landingPage.importantDates}
                  onChange={(e) => setLandingPage({ ...landingPage, importantDates: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={landingPage.primaryColor}
                    onChange={(e) => setLandingPage({ ...landingPage, primaryColor: e.target.value })}
                    className="w-full h-12 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <input
                    type="color"
                    value={landingPage.secondaryColor}
                    onChange={(e) => setLandingPage({ ...landingPage, secondaryColor: e.target.value })}
                    className="w-full h-12 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {currentTab === "rewards" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Scholarship Rewards</h3>
                <button
                  type="button"
                  onClick={addReward}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Reward
                </button>
              </div>

              <div className="space-y-4">
                {rewards.map((reward, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rank From</label>
                        <input
                          type="number"
                          value={reward.rankFrom}
                          onChange={(e) => updateReward(index, "rankFrom", Number(e.target.value))}
                          min={1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rank To</label>
                        <input
                          type="number"
                          value={reward.rankTo}
                          onChange={(e) => updateReward(index, "rankTo", Number(e.target.value))}
                          min={reward.rankFrom}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={reward.rewardType}
                          onChange={(e) => updateReward(index, "rewardType", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                          <option value="certificate">Certificate</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Value {reward.rewardType === "percentage" ? "(%)" : reward.rewardType === "fixed" ? "(₹)" : ""}
                        </label>
                        <input
                          type="number"
                          value={reward.rewardValue}
                          onChange={(e) => updateReward(index, "rewardValue", Number(e.target.value))}
                          min={0}
                          max={reward.rewardType === "percentage" ? 100 : undefined}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-end gap-2">
                        <button
                          type="button"
                          onClick={() => removeReward(index)}
                          className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={reward.description}
                        onChange={(e) => updateReward(index, "description", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 100% Tuition Fee Waiver"
                      />
                    </div>
                  </div>
                ))}

                {rewards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No rewards added yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Fields Tab */}
          {currentTab === "form" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Custom Registration Fields</h3>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Custom Field
                </button>
              </div>

              <div className="space-y-4">
                {customFields.map((field, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Field Name</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateCustomField(index, "name", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateCustomField(index, "label", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateCustomField(index, "type", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="tel">Phone</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="select">Dropdown</option>
                          <option value="textarea">Textarea</option>
                        </select>
                      </div>

                      <div className="flex items-end gap-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateCustomField(index, "required", e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Required</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeCustomField(index)}
                          className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {customFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No custom fields added</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Exam
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}