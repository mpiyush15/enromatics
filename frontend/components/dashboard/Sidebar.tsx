"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useOptionalAuth from "@/hooks/useOptionalAuth";
import Logout_Button from "@/app/dashboard/LogoutButton";
import useSWR from "swr";
import {
  FaHome,
  FaChartBar,
  FaUsers,
  FaClipboardList,
  FaShoppingCart,
  FaComments,
  FaWhatsapp,
  FaInbox,
  FaBullhorn,
  FaAddressBook,
  FaCog,
  FaCalendarAlt,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaBook,
  FaGraduationCap,
  FaFileAlt,
  FaFileInvoice,
  FaPhone,
  FaVideo,
  FaDollarSign,
  FaBuilding,
  FaStore,
  FaBarcode,
  FaBox,
  FaCheckCircle,
  FaCreditCard,
  FaEnvelope,
  FaWalking,
  FaLink,
} from "react-icons/fa";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  links?: SidebarLink[] | null;
}

// Theme Provider Component
function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newIsDark = !isDark;
    
    if (newIsDark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    setIsDark(newIsDark);
  };

  return { isDark, mounted, toggleTheme };
}

interface SidebarLink {
  label: string;
  href?: string;
  children?: SidebarLink[];
}

/* ------------------------ SWR FETCHER ------------------------ */
const sidebarFetcher = async (url: string) => {
  // Use BFF route which handles auth properly
  console.log('🔄 Sidebar fetcher - URL:', url);
  
  const res = await fetch(url, { 
    credentials: "include", // This sends JWT cookie automatically
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  console.log('🔄 Sidebar response status:', res.status);
  
  if (!res.ok) {
    const error = await res.json();
    console.error('❌ Sidebar fetch failed:', res.status, error);
    throw new Error(`Sidebar fetch failed: ${res.status}`);
  }
  
  const data = await res.json();
  console.log('✅ Sidebar fetched:', data.sidebar?.length || 0, 'items');
  return data.sidebar || [];
};

/* ------------------------ COMPONENT ------------------------ */
export default function Sidebar({ isOpen, onClose, links: externalLinks }: SidebarProps) {
  const isExternal = !!externalLinks?.length;
  const auth = isExternal ? useOptionalAuth() : useAuth();
  const { user, loading } = auth;
  const pathname = usePathname();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);
  const [cacheBust, setCacheBust] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDark, mounted, toggleTheme } = useTheme();

  // Load expanded state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarExpandedState');
    if (saved) {
      try {
        setExpanded(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to load sidebar state:', e);
      }
    }
    setHasInitialized(true);
  }, []);

  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    if (!hasInitialized) return;
    localStorage.setItem('sidebarExpandedState', JSON.stringify(Array.from(expanded)));
  }, [expanded, hasInitialized]);

  /* ------------------------ SWR ------------------------ */
  const { data: fetchedLinks = [], isLoading } = useSWR<SidebarLink[]>(
    isExternal ? null : `/api/ui/sidebar?role=${user?.role || 'guest'}&t=${user?.tenantId || 'global'}`,
    sidebarFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 60 * 1000, // 30 minutes
      keepPreviousData: true,
    }
  );

  const links = isExternal ? externalLinks! : fetchedLinks;

  // All tenant roles including all staff role types
  const TENANT_ROLES = ["tenantAdmin", "admin", "staff", "employee", "teacher", "manager", "counsellor", "adsManager", "accountant", "marketing"];

  // Helper: build href with tenant context
  const buildHrefLocal = (href: string) => {
    if (!href) return "#";
    
    // If href contains [tenantId] placeholder, ALWAYS replace it FIRST
    if (href.includes("[tenantId]")) {
      if (!user?.tenantId) {
        console.warn(`⚠️ buildHrefLocal: No tenantId available for href: ${href}`);
        return "#";
      }
      return href.replace("[tenantId]", user.tenantId);
    }
    
    if (href.includes("/client/")) return href;
    
    if (
      user?.tenantId &&
      TENANT_ROLES.includes(user.role) &&
      href.startsWith("/dashboard")
    ) {
      return `/dashboard/client/${user.tenantId}${href.replace("/dashboard", "")}`;
    }
    return href;
  };

  // Helper: find which dropdowns are parents of current active route
  // Memoized to prevent loop when links dependency changes
  const getRequiredOpenDropdowns = useCallback(() => {
    const requiredOpen = new Set<string>();
    
    const walk = (items: SidebarLink[], parents: string[] = []) => {
      for (const item of items) {
        if (item.href && pathname === buildHrefLocal(item.href)) {
          parents.forEach(p => requiredOpen.add(p));
        }
        if (item.children) {
          walk(item.children, [...parents, item.label]);
        }
      }
    };
    
    walk(links);
    return requiredOpen;
  }, [pathname, links]);

  /* ======================== AUTO-CLOSE UNRELATED DROPDOWNS ON NAVIGATION ======================== */
  /* When user navigates to a different page, close dropdowns that aren't parents of the new page.    */
  /* This prevents old dropdowns from staying open when you click a different nav link.              */
  useEffect(() => {
    if (!pathname || !user) return;
    if (links.length === 0) return;
    if (!hasInitialized) return;

    const requiredOpen = getRequiredOpenDropdowns();
    
    // Close dropdowns not needed for this page; keep only required ones
    setExpanded(requiredOpen);
  }, [pathname, user?.tenantId, user?.role, hasInitialized, getRequiredOpenDropdowns]);

  /* ======================== ENSURE ACTIVE PAGE DROPDOWNS STAY OPEN ======================== */
  /* Safety: if a dropdown is needed for the current page but somehow closed, open it again.   */
  useEffect(() => {
    if (!pathname || !user) return;
    if (links.length === 0) return;
    if (!hasInitialized) return;

    const requiredOpen = getRequiredOpenDropdowns();
    
    // Add required dropdowns in case they're missing
    setExpanded(prev => {
      const next = new Set(prev);
      requiredOpen.forEach(p => next.add(p));
      return next;
    });
  }, [pathname, user?.tenantId, user?.role, hasInitialized, getRequiredOpenDropdowns]);

  /* ------------------------ HELPERS ------------------------ */
  function buildHref(href: string) {
    if (!href) return "#";
    
    // If href contains [tenantId] placeholder, ALWAYS replace it FIRST
    if (href.includes("[tenantId]")) {
      if (!user?.tenantId) {
        console.warn(`⚠️ buildHref: No tenantId available for href: ${href}`);
        return "#";
      }
      const built = href.replace("[tenantId]", user.tenantId);
      return built;
    }
    
    if (href.includes("/client/")) return href;
    
    if (
      user?.tenantId &&
      TENANT_ROLES.includes(user.role) &&
      href.startsWith("/dashboard")
    ) {
      const built = `/dashboard/client/${user.tenantId}${href.replace("/dashboard", "")}`;
      return built;
    }
    return href;
  }

  function isActive(href?: string) {
    if (!href) return false;
    const builtHref = buildHref(href);
    return pathname === builtHref;
  }

  function toggle(label: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  // Map a label (or emoji) to a sensible icon fallback.
  function getIconForLabel(label: string | undefined) {
    if (!label) return null;
    const text = label.toLowerCase();
    
    // Home
    if (text.includes("home") || text.includes("🏠")) return <FaHome className="w-4 h-4" />;
    
    // Analytics & Reports
    if (text.includes("analytics") || text.includes("chart") || text.includes("📊")) return <FaChartBar className="w-4 h-4" />;
    if (text.includes("dashboard")) return <FaChartBar className="w-4 h-4" />;
    if (text.includes("report")) return <FaFileAlt className="w-4 h-4" />;
    
    // Leads & CRM
    if (text.includes("lead") || text.includes("leads") || text.includes("📋")) return <FaClipboardList className="w-4 h-4" />;
    if (text.includes("crm") || text.includes("customer")) return <FaAddressBook className="w-4 h-4" />;
    
    // Users & Admin
    if (text.includes("tenants") || text.includes("👤") || text.includes("users")) return <FaUsers className="w-4 h-4" />;
    if (text.includes("staff")) return <FaUsers className="w-4 h-4" />;
    if (text.includes("student")) return <FaGraduationCap className="w-4 h-4" />;
    if (text.includes("teacher")) return <FaBook className="w-4 h-4" />;
    
    // Subscription & Payments
    if (text.includes("subscription") || text.includes("💳") || text.includes("💰")) return <FaCreditCard className="w-4 h-4" />;
    if (text.includes("payment") || text.includes("billing")) return <FaDollarSign className="w-4 h-4" />;
    if (text.includes("invoice")) return <FaFileInvoice className="w-4 h-4" />;
    if (text.includes("expense") || text.includes("finance")) return <FaDollarSign className="w-4 h-4" />;
    
    // Social & Marketing
    if (text.includes("social") || text.includes("facebook") || text.includes("instagram")) return <FaBullhorn className="w-4 h-4" />;
    if (text.includes("marketing") || text.includes("campaign")) return <FaBullhorn className="w-4 h-4" />;
    if (text.includes("email") || text.includes("mail")) return <FaEnvelope className="w-4 h-4" />;
    
    // Communication
    if (text.includes("whatsapp") || text.includes("📱") || text.includes("🤖")) return <FaWhatsapp className="w-4 h-4" />;
    if (text.includes("sms") || text.includes("message")) return <FaComments className="w-4 h-4" />;
    if (text.includes("call") || text.includes("phone")) return <FaPhone className="w-4 h-4" />;
    if (text.includes("inbox") || text.includes("📥")) return <FaInbox className="w-4 h-4" />;
    if (text.includes("reply")) return <FaComments className="w-4 h-4" />;
    
    // Education & LMS
    if (text.includes("lms") || text.includes("lesson") || text.includes("course")) return <FaBook className="w-4 h-4" />;
    if (text.includes("test") || text.includes("quiz")) return <FaClipboardList className="w-4 h-4" />;
    if (text.includes("subject")) return <FaGraduationCap className="w-4 h-4" />;
    if (text.includes("chapter")) return <FaBook className="w-4 h-4" />;
    if (text.includes("question")) return <FaClipboardList className="w-4 h-4" />;
    if (text.includes("progress")) return <FaCheckCircle className="w-4 h-4" />;
    
    // Commerce & Store
    if (text.includes("product") || text.includes("products")) return <FaBox className="w-4 h-4" />;
    if (text.includes("store") || text.includes("shop")) return <FaStore className="w-4 h-4" />;
    if (text.includes("inventory")) return <FaBarcode className="w-4 h-4" />;
    if (text.includes("order")) return <FaClipboardList className="w-4 h-4" />;
    
    // Calendar & Events
    if (text.includes("calendar") || text.includes("event") || text.includes("schedule") || text.includes("🗓")) return <FaCalendarAlt className="w-4 h-4" />;
    if (text.includes("booking")) return <FaCalendarAlt className="w-4 h-4" />;
    if (text.includes("attendance")) return <FaCheckCircle className="w-4 h-4" />;
    
    // Content & Pages
    if (text.includes("blog") || text.includes("article") || text.includes("content")) return <FaFileAlt className="w-4 h-4" />;
    if (text.includes("page") || text.includes("pages")) return <FaFileAlt className="w-4 h-4" />;
    if (text.includes("video")) return <FaVideo className="w-4 h-4" />;
    
    // Organization
    if (text.includes("contact") || text.includes("contacts") || text.includes("👥")) return <FaAddressBook className="w-4 h-4" />;
    if (text.includes("institute") || text.includes("organization") || text.includes("building")) return <FaBuilding className="w-4 h-4" />;
    if (text.includes("department")) return <FaBuilding className="w-4 h-4" />;
    
    // Settings & Admin
    if (text.includes("settings") || text.includes("⚙️") || text.includes("config")) return <FaCog className="w-4 h-4" />;
    if (text.includes("profile") || text.includes("🧑‍💻") || text.includes("account")) return <FaUserCircle className="w-4 h-4" />;
    if (text.includes("integration") || text.includes("connect")) return <FaLink className="w-4 h-4" />;
    
    // Academics
    if (text.includes("academic") || text.includes("📚")) return <FaGraduationCap className="w-4 h-4" />;
    
    // default
    return <FaClipboardList className="w-4 h-4" />;
  }

  // Remove emojis from label text
  function cleanLabel(label: string) {
    return label.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  }

  // Check if feature is locked for current user
  function isFeatureLocked(label: string) {
    if (!user) return false;
    const isTrialOrBasic = user.plan === 'trial' || user.plan === 'basic';
    const text = label.toLowerCase();
    return isTrialOrBasic && (text.includes('whatsapp') || text.includes('social'));
  }

  function handleClick() {
    if (window.innerWidth < 768) onClose();
  }

  /* ------------------------ LOADING STATE ------------------------ */
  // Wait for user to load if not external (prevents wrong URLs)
  if (!isExternal && (loading || !user)) {
    return (
      <aside className="w-72 h-screen bg-gray-800 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-gray-400">Loading user data...</div>
        </div>
      </aside>
    );
  }

  // Show loading only if we're still fetching sidebar links
  if (isLoading && links.length === 0) {
    return (
      <aside className="w-72 h-screen bg-gray-800 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-gray-400">Loading sidebar...</div>
        </div>
      </aside>
    );
  }

  /* ------------------------ RENDER ------------------------ */
  return (
    <aside
      className={`fixed md:sticky top-0 left-0 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } h-screen ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 flex flex-col ${
        isDark 
          ? 'bg-gray-900/40 text-white' 
          : 'bg-stone-50/40 text-gray-900'
      } backdrop-blur-xl border-r ${
        isDark 
          ? 'border-gray-700/30' 
          : 'border-stone-200/30'
      } shadow-2xl`}
      style={{
        backgroundImage: isDark 
          ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.4) 0%, rgba(31, 41, 55, 0.2) 100%)'
          : 'linear-gradient(135deg, rgba(245, 245, 244, 0.4) 0%, rgba(231, 229, 228, 0.2) 100%)',
      }}
    >
      {/* Mobile close */}
      <div className="md:hidden flex justify-end p-4">
        <button 
          onClick={onClose}
          className={`transition-colors ${
            isDark 
              ? 'text-gray-400 hover:text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Header with Collapse Button */}
      <div className={`px-4 py-4 border-b backdrop-blur-sm flex items-center justify-between ${
        isDark 
          ? 'border-gray-700/30' 
          : 'border-stone-200/30'
      }`}>
        {!sidebarCollapsed && (
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Nav
          </h1>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`p-1.5 rounded-lg transition-all duration-300 ${
            isDark
              ? 'text-gray-400 hover:text-white hover:bg-white/10'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/30'
          }`}
          title={sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          {sidebarCollapsed ? (
            <FaChevronRight className="w-4 h-4" />
          ) : (
            <FaChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Menu */}
      <div className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-3'} py-4 scrollbar-hide`} style={{ scrollBehavior: 'smooth' }}>
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <ul className="space-y-0.5">
          {links.map((section, idx) => (
            <li key={section.label}>
              {idx > 0 && <div className={`my-2 border-t ${isDark ? 'border-gray-700/20' : 'border-stone-200/20'}`} />}
              
              {/* Section */}
              {section.children ? (
                <>
                  <button
                    onClick={() => toggle(section.label)}
                    title={sidebarCollapsed ? cleanLabel(section.label) : ''}
                    className={`w-full flex items-center justify-between transition-all duration-200 group rounded-lg ${
                      expanded.has(section.label)
                        ? sidebarCollapsed
                          ? `px-2 py-2.5 ${isDark ? 'bg-white/10 text-white' : 'bg-stone-200/20 text-gray-900'}`
                          : `px-3 py-2.5 text-sm font-medium ${isDark ? 'bg-white/15 text-white' : 'bg-stone-200/30 text-gray-900'}`
                        : sidebarCollapsed
                          ? `px-2 py-2.5 ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/20'} rounded-lg`
                          : `px-3 py-2 text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/20'} rounded-lg`
                    }`}
                  >
                    <span className={`flex items-center gap-2 flex-1 min-w-0`}>
                      <span className={`${expanded.has(section.label) ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-400' : 'text-stone-600')} transition-colors flex-shrink-0`}>
                        {getIconForLabel(section.label)}
                      </span>
                      {!sidebarCollapsed && (
                        <span className={`text-sm font-medium transition-colors whitespace-nowrap overflow-hidden`}>
                          {cleanLabel(section.label)}
                        </span>
                      )}
                    </span>
                    {!sidebarCollapsed && (
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${expanded.has(section.label) ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-stone-600'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {expanded.has(section.label) && !sidebarCollapsed && (
                    <ul className={`ml-2 mt-1 space-y-0.5 border-l ${isDark ? 'border-gray-700/30' : 'border-stone-200/30'} pl-2`}>
                      {section.children.map(child =>
                        child.children ? (
                          <li key={child.label}>
                            <button
                              onClick={() => toggle(child.label)}
                              className={`w-full flex items-center justify-between transition-all duration-150 px-2 py-1.5 text-xs rounded-md ${
                                expanded.has(child.label)
                                  ? isDark 
                                    ? 'bg-white/10 text-white' 
                                    : 'bg-stone-200/20 text-gray-900'
                                  : isDark 
                                    ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/15'
                              }`}
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                {getIconForLabel(child.label)} 
                                <span className="truncate">{cleanLabel(child.label)}</span>
                              </span>
                              <svg
                                className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${expanded.has(child.label) ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {expanded.has(child.label) && (
                              <ul className={`ml-2 mt-0.5 space-y-0.5 border-l ${isDark ? 'border-gray-700/30' : 'border-stone-200/30'} pl-2`}>
                                {child.children.map(grand => (
                                  <li key={grand.label}>
                                    <Link
                                      href={buildHref(grand.href!)}
                                      onClick={handleClick}
                                      className={`block px-2 py-1 text-xs rounded-md transition-all duration-150 ${
                                        isActive(grand.href)
                                          ? isDark
                                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/30"
                                            : "bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-medium shadow-lg shadow-blue-300/30"
                                          : isDark
                                            ? "text-gray-400 hover:text-white hover:bg-white/5"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-blue-200/15"
                                      }`}
                                    >
                                      <span className="flex items-center gap-2">{getIconForLabel(grand.label)} <span className="truncate">{cleanLabel(grand.label)}</span></span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ) : (
                          <li key={child.label}>
                            <Link
                              href={buildHref(child.href!)}
                              onClick={handleClick}
                              className={`block px-2 py-1 text-xs rounded-md transition-all duration-150 ${
                                isActive(child.href)
                                  ? isDark
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/30"
                                    : "bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-medium shadow-lg shadow-blue-300/30"
                                  : isDark
                                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-blue-200/15"
                              }`}
                            >
                              <span className="flex items-center gap-2">{getIconForLabel(child.label)} <span className="truncate">{cleanLabel(child.label)}</span></span>
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={buildHref(section.href!)}
                  onClick={handleClick}
                  title={sidebarCollapsed ? cleanLabel(section.label) : ''}
                  className={`flex items-center gap-2 transition-all duration-200 group rounded-lg ${
                    isActive(section.href)
                      ? isDark
                        ? "px-3 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/30"
                        : "px-3 py-2.5 text-sm bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-medium shadow-lg shadow-blue-300/30"
                      : sidebarCollapsed
                        ? `px-2 py-2.5 ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/20'}`
                        : `px-3 py-2 text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/20'}`
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive(section.href) ? 'text-white' : (isDark ? 'text-gray-400' : 'text-stone-600')} transition-colors`}>
                    {getIconForLabel(section.label)}
                  </span>
                  {!sidebarCollapsed && (
                    <span className={`text-sm font-medium whitespace-nowrap overflow-hidden`}>
                      {cleanLabel(section.label)}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Profile Section with Theme Toggle */}
      <div className={`p-3 border-t backdrop-blur-sm ${
        isDark 
          ? 'border-gray-700/30 bg-gray-900/50' 
          : 'border-stone-200/30 bg-stone-50/50'
      }`}>
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className={`w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-yellow-400'
                : 'bg-stone-200/30 hover:bg-stone-200/50 text-stone-600'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {!sidebarCollapsed && (
              <span className="text-xs font-medium">
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </span>
            )}
            {sidebarCollapsed && (
              <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
            )}
          </button>
        )}

        {/* User Profile */}
        {user && !sidebarCollapsed && (
          <div className={`mb-2 p-2 rounded-lg border ${
            isDark
              ? 'bg-gray-800/40 border-gray-700/30'
              : 'bg-stone-100/50 border-stone-200/30'
          }`}>
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-xs">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user.name || user.email}
                  </p>
                  <p className={`text-xs capitalize truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user.role}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Link
                  href="/dashboard/profile"
                  onClick={handleClick}
                  className={`px-2 py-1 text-xs rounded transition-all font-medium ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-400 hover:bg-blue-500 text-white'
                  }`}
                >
                  Edit
                </Link>
                <Logout_Button />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
