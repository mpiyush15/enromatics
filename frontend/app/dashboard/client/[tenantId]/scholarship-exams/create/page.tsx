"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, Eye } from "lucide-react";

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

export default function CreateExamPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;

  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<"basic" | "landing" | "rewards" | "form">("basic");

  // Basic Details
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
        tenantId,
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
        status: "draft",
      };

      const response = await fetch("/api/scholarship-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create exam");
      }

      const data = await response.json();
      alert(`Exam created successfully! Exam Code: ${data.exam.examCode}`);
      router.push(`/dashboard/client/${tenantId}/scholarship-exams`);
    } catch (error: any) {
      console.error("Error creating exam:", error);
      alert(error.message || "Failed to create exam");
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Exams
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Scholarship Entrance Exam</h1>
          <p className="text-gray-600 mt-1">Set up your exam details, landing page, and rewards</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setCurrentTab("basic")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                currentTab === "basic"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Basic Details
            </button>
            <button
              onClick={() => setCurrentTab("landing")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                currentTab === "landing"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Landing Page
            </button>
            <button
              onClick={() => setCurrentTab("rewards")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                currentTab === "rewards"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Rewards/Scholarships
            </button>
            <button
              onClick={() => setCurrentTab("form")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                currentTab === "form"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Form Fields
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Details Tab */}
          {currentTab === "basic" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      placeholder="e.g., ABC Scholarship Test 2024"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description about the exam"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={registrationStartDate}
                      onChange={(e) => setRegistrationStartDate(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={registrationEndDate}
                      onChange={(e) => setRegistrationEndDate(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Multiple Exam Dates */}
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Exam Dates <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={addExamDate}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={16} />
                        Add Date
                      </button>
                    </div>
                    <div className="space-y-2">
                      {examDates.map((date, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => updateExamDate(index, e.target.value)}
                            required
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <p className="text-xs text-gray-500 mt-1">
                      Students will choose their preferred exam date during registration
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Result Date</label>
                    <input
                      type="date"
                      value={resultDate}
                      onChange={(e) => setResultDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={examDuration}
                      onChange={(e) => setExamDuration(parseInt(e.target.value))}
                      required
                      min={30}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(parseInt(e.target.value))}
                      required
                      min={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(parseInt(e.target.value))}
                      required
                      min={1}
                      max={totalMarks}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={examMode}
                      onChange={(e) => setExamMode(e.target.value as any)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  {(examMode === "offline" || examMode === "hybrid") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="Exam center address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee (₹)</label>
                    <input
                      type="number"
                      value={registrationFee}
                      onChange={(e) => setRegistrationFee(parseInt(e.target.value))}
                      min={0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Eligibility Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Age</label>
                    <input
                      type="number"
                      value={minAge}
                      onChange={(e) => setMinAge(parseInt(e.target.value))}
                      min={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Age</label>
                    <input
                      type="number"
                      value={maxAge}
                      onChange={(e) => setMaxAge(parseInt(e.target.value))}
                      min={minAge}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Classes</label>
                    <input
                      type="text"
                      value={eligibleClasses.join(", ")}
                      onChange={(e) =>
                        setEligibleClasses(e.target.value.split(",").map((c) => c.trim()).filter(Boolean))
                      }
                      placeholder="e.g., 8, 9, 10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple classes with commas</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualification Requirements</label>
                    <textarea
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g., Minimum 60% in previous class"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Landing Page Tab */}
          {currentTab === "landing" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Landing Page Customization</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                  <input
                    type="text"
                    value={landingPage.heroTitle}
                    onChange={(e) => setLandingPage({ ...landingPage, heroTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                  <input
                    type="text"
                    value={landingPage.heroSubtitle}
                    onChange={(e) => setLandingPage({ ...landingPage, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">About the Exam</label>
                  <textarea
                    value={landingPage.aboutExam}
                    onChange={(e) => setLandingPage({ ...landingPage, aboutExam: e.target.value })}
                    rows={4}
                    placeholder="Describe the exam, its purpose, and benefits"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus</label>
                  <textarea
                    value={landingPage.syllabus}
                    onChange={(e) => setLandingPage({ ...landingPage, syllabus: e.target.value })}
                    rows={4}
                    placeholder="List topics covered in the exam"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Important Dates</label>
                  <textarea
                    value={landingPage.importantDates}
                    onChange={(e) => setLandingPage({ ...landingPage, importantDates: e.target.value })}
                    rows={3}
                    placeholder="List all important dates and deadlines"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={landingPage.primaryColor}
                        onChange={(e) => setLandingPage({ ...landingPage, primaryColor: e.target.value })}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={landingPage.primaryColor}
                        onChange={(e) => setLandingPage({ ...landingPage, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={landingPage.secondaryColor}
                        onChange={(e) => setLandingPage({ ...landingPage, secondaryColor: e.target.value })}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={landingPage.secondaryColor}
                        onChange={(e) => setLandingPage({ ...landingPage, secondaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {currentTab === "rewards" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Rewards & Scholarships</h3>
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
                          onChange={(e) => updateReward(index, "rankFrom", parseInt(e.target.value))}
                          min={1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rank To</label>
                        <input
                          type="number"
                          value={reward.rankTo}
                          onChange={(e) => updateReward(index, "rankTo", parseInt(e.target.value))}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                        <input
                          type="number"
                          value={reward.rewardValue}
                          onChange={(e) => updateReward(index, "rewardValue", parseInt(e.target.value))}
                          min={0}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeReward(index)}
                          className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} className="mx-auto" />
                        </button>
                      </div>

                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                          type="text"
                          value={reward.description}
                          onChange={(e) => updateReward(index, "description", e.target.value)}
                          placeholder="e.g., 100% tuition fee waiver"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {rewards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No rewards added yet</p>
                    <button
                      type="button"
                      onClick={addReward}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add your first reward
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Fields Tab */}
          {currentTab === "form" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Form Fields</h3>
                <p className="text-sm text-gray-600">Default fields are always included. Add custom fields below.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Default Fields (Always Included):</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-700">
                  <div>✓ Full Name</div>
                  <div>✓ Email</div>
                  <div>✓ Phone</div>
                  <div>✓ Date of Birth</div>
                  <div>✓ Gender</div>
                  <div>✓ Father's Name</div>
                  <div>✓ Mother's Name</div>
                  <div>✓ Parent's Phone</div>
                  <div>✓ Current Class</div>
                  <div>✓ School Name</div>
                  <div>✓ Full Address</div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Custom Fields</h4>
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
          <div className="mt-6 flex justify-end gap-4">
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
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Exam
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
