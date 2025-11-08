"use client";
import React from "react";

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow hover:shadow-md transition">
      <div className="text-4xl mb-4 text-blue-600 dark:text-blue-400">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}