"use client";

import { useState } from "react";

interface BookDemoModalProps {
  onClose: () => void;
}

export default function BookDemoModal({ onClose }: BookDemoModalProps) {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Form, Step 2: Calendar + Time
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10,}$/.test(formData.phone.replace(/[^0-9]/g, "")))
      newErrors.phone = "Invalid phone number";
    if (!formData.company.trim()) newErrors.company = "Company name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedDate) newErrors.date = "Please select a date";
    if (!selectedTime) newErrors.time = "Please select a time";

    // Validate date is not in the past
    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Please select a future date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleStep2Back = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Format date and time
      const dateTime = new Date(selectedDate!);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      dateTime.setHours(hours, minutes, 0, 0);

      const payload = {
        ...formData,
        demoDateTime: dateTime.toISOString(),
        date: selectedDate?.toISOString().split("T")[0],
        time: selectedTime,
      };

      const response = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit demo request");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("❌ Demo booking error:", error);
      setErrors({
        submit: error.message || "Failed to book demo. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 10 + i;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📅 Book Demo</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-blue-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                Demo Booked!
              </h3>
              <p className="text-gray-600">
                We'll contact you soon at {formData.email}
              </p>
            </div>
          ) : (
            <>
              {/* Step 1: Contact Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Your Details
                  </h3>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institute/Company Name *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Your Institute Name"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.company ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.company && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.company}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your institute..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleStep1Next}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-6"
                  >
                    Next: Choose Date & Time →
                  </button>
                </div>
              )}

              {/* Step 2: Date & Time Selection */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Select Demo Date & Time
                  </h3>

                  {/* Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value + "T00:00:00");
                          setSelectedDate(date);
                        }
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-2">{errors.date}</p>
                    )}
                    {selectedDate && (
                      <p className="text-sm text-blue-600 mt-2 font-medium">
                        Selected: {selectedDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Time (IST) *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                            selectedTime === time
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {errors.time && (
                      <p className="text-red-500 text-sm mt-2">{errors.time}</p>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedDate && selectedTime && (
                    <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Demo Scheduled:</strong>{" "}
                        {selectedDate.toLocaleDateString()} at {selectedTime}
                      </p>
                    </div>
                  )}

                  {/* Error Messages */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleStep2Back}
                      className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
                    >
                      {loading ? "Booking..." : "✓ Confirm Demo"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
