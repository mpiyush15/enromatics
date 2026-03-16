"use client";

import { useState } from "react";
import Link from "next/link";

const COURSES = [
  {
    id: "neet-2024",
    title: "NEET 2024 Complete Guide",
    category: "Medical",
    price: 4999,
    originalPrice: 9999,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=300&fit=crop",
    rating: 4.8,
    students: 12500,
    lessons: 156,
    instructor: "Dr. Rajesh Sharma",
    description: "Complete NEET preparation with live classes, mock tests, and doubt clearing sessions",
  },
  {
    id: "jee-advanced",
    title: "JEE Advanced Masterclass",
    category: "Engineering",
    price: 5999,
    originalPrice: 11999,
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=300&fit=crop",
    rating: 4.9,
    students: 8900,
    lessons: 203,
    instructor: "Prof. Amit Kumar",
    description: "Advanced problem-solving techniques for JEE Main and Advanced exams",
  },
  {
    id: "board-12",
    title: "Class 12 Board Exam Prep",
    category: "Board Exam",
    price: 2999,
    originalPrice: 5999,
    image: "https://images.unsplash.com/photo-1516534775068-bb57fbb92d50?w=500&h=300&fit=crop",
    rating: 4.7,
    students: 25000,
    lessons: 128,
    instructor: "Ms. Priya Singh",
    description: "Complete CBSE/State board curriculum with previous year papers",
  },
  {
    id: "foundation",
    title: "Science Foundation Course",
    category: "Foundation",
    price: 1999,
    originalPrice: 3999,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    rating: 4.6,
    students: 45000,
    lessons: 95,
    instructor: "Dr. Vikram Patel",
    description: "Build strong fundamentals in Physics, Chemistry, and Biology",
  },
  {
    id: "olympiad",
    title: "Science Olympiad Prep",
    category: "Olympiad",
    price: 3499,
    originalPrice: 6999,
    image: "https://images.unsplash.com/photo-1509228627152-72ae9e29f773?w=500&h=300&fit=crop",
    rating: 4.9,
    students: 6700,
    lessons: 142,
    instructor: "Prof. Arun Verma",
    description: "Specialized training for National and International Science Olympiads",
  },
  {
    id: "coding",
    title: "Competitive Programming",
    category: "Programming",
    price: 3999,
    originalPrice: 7999,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
    rating: 4.8,
    students: 5400,
    lessons: 180,
    instructor: "Kunal Kushwaha",
    description: "Master data structures, algorithms, and competitive coding",
  },
];

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", ...new Set(COURSES.map(c => c.category))];
  
  const filteredCourses = selectedCategory === "All" 
    ? COURSES 
    : COURSES.filter(c => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Transform Your Future with <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Expert-Led Courses</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Learn from industry experts and prepare for your success with comprehensive, structured curriculum
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-2xl">⭐</span> 4.8 Average Rating
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-2xl">👥</span> 100K+ Students
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex gap-3 overflow-x-auto pb-4 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <Link href={`/courses/${course.id}`} key={course.id}>
              <div className="group bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer h-full flex flex-col">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-slate-700">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {course.category}
                    </span>
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {Math.round((1 - course.price/course.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-300">
                    <span>👨‍🏫 {course.instructor}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6 py-4 border-y border-slate-700">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{course.lessons}</div>
                      <div className="text-xs text-gray-400">Lessons</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">⭐ {course.rating}</div>
                      <div className="text-xs text-gray-400">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{(course.students/1000).toFixed(1)}K</div>
                      <div className="text-xs text-gray-400">Students</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl font-bold text-white">₹{course.price.toLocaleString()}</span>
                    <span className="text-lg text-gray-400 line-through">₹{course.originalPrice.toLocaleString()}</span>
                  </div>

                  {/* Button */}
                  <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all group-hover:shadow-lg">
                    View Course →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
