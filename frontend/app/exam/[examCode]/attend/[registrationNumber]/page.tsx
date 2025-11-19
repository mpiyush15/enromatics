"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, User, CheckCircle, AlertCircle, FileText, Send } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface Question {
  id: string;
  question: string;
  options: string[];
  type: "mcq" | "text";
  marks: number;
}

interface ExamData {
  _id: string;
  examName: string;
  examCode: string;
  examDuration: number;
  totalMarks: number;
  passingMarks: number;
  questions: Question[];
  instructions: string[];
}

interface StudentData {
  registrationNumber: string;
  studentName: string;
  email: string;
  examDate: string;
}

export default function ExamAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const examCode = params.examCode as string;
  const registrationNumber = params.registrationNumber as string;

  const [exam, setExam] = useState<ExamData | null>(null);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);

  useEffect(() => {
    fetchExamData();
  }, [examCode, registrationNumber]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      
      // This would typically verify the student's registration and exam eligibility
      // For now, we'll simulate the exam data
      const simulatedExam: ExamData = {
        _id: "exam_id",
        examName: "Science Scholarship Test 2024",
        examCode: examCode,
        examDuration: 120, // minutes
        totalMarks: 100,
        passingMarks: 40,
        instructions: [
          "Read all questions carefully before answering",
          "Each question carries equal marks",
          "There is no negative marking",
          "You can review and change your answers before final submission",
          "Make sure to submit before time runs out"
        ],
        questions: [
          {
            id: "q1",
            question: "What is the chemical formula for water?",
            options: ["H2O", "CO2", "NaCl", "O2"],
            type: "mcq",
            marks: 4
          },
          {
            id: "q2", 
            question: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            type: "mcq",
            marks: 4
          },
          {
            id: "q3",
            question: "What is 15 + 27?",
            options: ["42", "41", "43", "40"],
            type: "mcq",
            marks: 4
          },
          {
            id: "q4",
            question: "Explain the process of photosynthesis in 2-3 sentences.",
            options: [],
            type: "text",
            marks: 8
          },
          {
            id: "q5",
            question: "What is the capital of India?",
            options: ["Mumbai", "Delhi", "New Delhi", "Kolkata"],
            type: "mcq",
            marks: 4
          }
        ]
      };

      const simulatedStudent: StudentData = {
        registrationNumber: registrationNumber,
        studentName: "Demo Student",
        email: "demo@example.com",
        examDate: new Date().toISOString()
      };

      setExam(simulatedExam);
      setStudent(simulatedStudent);
      setTimeLeft(simulatedExam.examDuration * 60); // Convert to seconds
      
    } catch (error) {
      console.error("❌ Error fetching exam data:", error);
      alert("Failed to load exam. Please contact support.");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    setExamStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitExam = async () => {
    if (submitting) return;
    
    if (!confirm("Are you sure you want to submit your exam? You cannot change answers after submission.")) {
      return;
    }

    setSubmitting(true);

    try {
      // Here you would submit to your actual API
      console.log("Submitting exam answers:", answers);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExamCompleted(true);
    } catch (error) {
      console.error("❌ Error submitting exam:", error);
      alert("Failed to submit exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(key => answers[key] && answers[key].trim() !== "").length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Invalid exam code or registration number.</p>
        </div>
      </div>
    );
  }

  if (examCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted Successfully!</h1>
          <p className="text-gray-600 mb-6">Your answers have been recorded. Results will be published soon.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 mb-2">Registration Number:</p>
            <p className="text-lg font-bold text-blue-800 font-mono">{student.registrationNumber}</p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Keep your registration number safe. You'll need it to check your results.
          </p>

          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.examName}</h1>
            <p className="text-gray-600">Exam Code: <span className="font-mono font-bold">{exam.examCode}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {student.studentName}</p>
                <p><span className="font-medium">Registration:</span> {student.registrationNumber}</p>
                <p><span className="font-medium">Email:</span> {student.email}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Duration:</span> {exam.examDuration} minutes</p>
                <p><span className="font-medium">Total Marks:</span> {exam.totalMarks}</p>
                <p><span className="font-medium">Passing Marks:</span> {exam.passingMarks}</p>
                <p><span className="font-medium">Questions:</span> {exam.questions.length}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="space-y-2">
                {exam.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span className="text-sm text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startExam}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.examName}</h1>
              <p className="text-sm text-gray-600">Registration: {student.registrationNumber}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Answered</p>
                <p className="text-lg font-bold text-blue-600">{getAnsweredCount()}/{exam.questions.length}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Time Left</p>
                <p className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>

              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Exam
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {exam.questions.map((question, idx) => (
            <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Question {idx + 1}
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {question.marks} marks
                </span>
              </div>

              <p className="text-gray-800 mb-6 leading-relaxed">{question.question}</p>

              {question.type === "mcq" ? (
                <div className="space-y-3">
                  {question.options.map((option, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        answers[question.id] === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type your answer here..."
                />
              )}

              {answers[question.id] && (
                <div className="mt-3 flex items-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-sm">Answer saved</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Submit Button */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <button
            onClick={handleSubmitExam}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold mx-auto"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting Exam...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Exam ({getAnsweredCount()}/{exam.questions.length} answered)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}