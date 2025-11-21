"use client";

import { useState } from "react";
import Link from "next/link";

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  gradient: string;
  badge?: {
    text: string;
    color: string;
  };
  loading?: boolean;
}

export default function ActionCard({
  title,
  description,
  icon,
  href,
  onClick,
  gradient,
  badge,
  loading = false
}: ActionCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);

  const content = (
    <div 
      className={`rounded-2xl shadow-lg p-4 md:p-6 h-full flex flex-col justify-between transform transition-all duration-300 
         hover:scale-105 hover:shadow-2xl active:scale-95 cursor-pointer select-none relative overflow-hidden 
         min-h-[140px] bg-gradient-to-br ${gradient} text-white group ${
        isPressed ? 'scale-95' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={onClick}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 text-6xl transform rotate-12 group-hover:rotate-45 transition-transform duration-300">
          {icon}
        </div>
      </div>

      {/* Badge */}
      {badge && (
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
          {badge.text}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-lg md:text-xl font-bold leading-tight">
              {title}
            </h3>
          </div>
          <p className="text-white/90 text-sm md:text-base leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
            <span className="mr-2 text-sm">Go to</span>
            <span className="text-lg">→</span>
          </div>
          
          {/* Pulse animation */}
          <div className="w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}