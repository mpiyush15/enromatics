// Unified Theme Colors for AI Admission Engine

export const admissionEngineTheme = {
  // Primary Colors - Purple/Blue Mix
  primary: {
    dark: "rgb(99, 102, 241)", // Indigo-600
    light: "rgb(129, 140, 248)", // Indigo-400
    veryLight: "rgb(224, 231, 255)", // Indigo-100
    hover: "rgb(110, 114, 255)", // Indigo hover
  },

  // Accent Colors - Light Purple
  accent: {
    light: "rgb(243, 232, 255)", // Purple-100
    lighter: "rgb(250, 245, 255)", // Purple-50
    border: "rgb(216, 180, 254)", // Purple-300
  },

  // Text Colors
  text: {
    heading: "rgb(79, 70, 229)", // Indigo-600
    subheading: "rgb(99, 102, 241)", // Indigo-600
    muted: "rgb(107, 114, 128)", // Gray-600
  },

  // Chart Colors
  chart: {
    bar: "rgb(99, 102, 241)", // Indigo
    pie: ["rgb(99, 102, 241)", "rgb(139, 92, 246)", "rgb(168, 85, 247)", "rgb(192, 132, 250)", "rgb(216, 180, 254)", "rgb(233, 213, 255)"],
  },

  // Status Badge Colors
  status: {
    critical: "rgb(239, 68, 68)", // Red (for urgent)
    high: "rgb(245, 158, 11)", // Amber
    medium: "rgb(59, 130, 246)", // Blue
    low: "rgb(34, 197, 94)", // Green
  },
};

// Tailwind CSS classes for easy application
export const headingClasses = "text-indigo-600 dark:text-indigo-400";
export const cardHeaderClasses = "text-lg font-bold text-indigo-600 dark:text-indigo-400";
export const buttonPrimaryClasses = "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white";
export const cardHoverClasses = "hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700";
export const filterButtonClasses = "px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition";
export const chartBarColor = "#6366f1"; // Indigo
export const chartPieColors = ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff"];
