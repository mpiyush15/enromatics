"use client";

import { useEffect, useState } from "react";
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
} from "react-icons/fa";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  links?: SidebarLink[] | null;
}

interface SidebarLink {
  label: string;
  href?: string;
  children?: SidebarLink[];
}

/* ------------------------ SWR FETCHER ------------------------ */
const sidebarFetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Sidebar fetch failed");
  const data = await res.json();
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
    isExternal ? null : "/api/ui/sidebar",
    sidebarFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 60 * 1000,
      keepPreviousData: true,
    }
  );

  const links = isExternal ? externalLinks! : fetchedLinks;

  // All tenant roles including all staff role types
  const TENANT_ROLES = ["tenantAdmin", "admin", "staff", "employee", "teacher", "manager", "counsellor", "adsManager", "accountant", "marketing"];

  // Helper: build href with tenant context
  const buildHrefLocal = (href: string) => {
    if (href.includes("/client/")) return href;
    
    // ✅ EXCEPTION: WhatsApp routes are NOT tenant-specific (shared across all tenants)
    if (href.includes("/whatsapp/")) return href;
    
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
  const getRequiredOpenDropdowns = () => {
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
  };

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
  }, [pathname, user?.tenantId, user?.role, hasInitialized, links]);

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
  }, [pathname, user?.tenantId, user?.role, hasInitialized, links]);

  /* ------------------------ HELPERS ------------------------ */
  // Debug: Log user state
  console.log("🔍 Sidebar render - User:", user?.email, "Role:", user?.role, "TenantID:", user?.tenantId, "Loading:", loading);

  function buildHref(href: string) {
    if (href.includes("/client/")) return href;
    
    // ✅ EXCEPTION: WhatsApp routes are NOT tenant-specific (shared across all tenants)
    if (href.includes("/whatsapp/")) return href;
    
    if (
      user?.tenantId &&
      TENANT_ROLES.includes(user.role) &&
      href.startsWith("/dashboard")
    ) {
      const built = `/dashboard/client/${user.tenantId}${href.replace("/dashboard", "")}`;
      console.log(`🔧 buildHref: "${href}" → "${built}"`);
      return built;
    }
    console.log(`🔧 buildHref: "${href}" → unchanged (no tenant conversion)`);
    return href;
  }

  function isActive(href?: string) {
    if (!href) return false;
    return pathname === buildHref(href);
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
    if (text.includes("home") || text.includes("🏠")) return <FaHome className="w-4 h-4" />;
    if (text.includes("analytics") || text.includes("chart") || text.includes("📊")) return <FaChartBar className="w-4 h-4" />;
    if (text.includes("lead") || text.includes("leads") || text.includes("📋")) return <FaClipboardList className="w-4 h-4" />;
    if (text.includes("tenants") || text.includes("👤") || text.includes("users")) return <FaUsers className="w-4 h-4" />;
    if (text.includes("subscription") || text.includes("💳") || text.includes("💰")) return <FaShoppingCart className="w-4 h-4" />;
    if (text.includes("social") || text.includes("facebook") || text.includes("instagram")) return <FaBullhorn className="w-4 h-4" />;
    if (text.includes("whatsapp") || text.includes("📱") || text.includes("🤖")) return <FaWhatsapp className="w-4 h-4" />;
    if (text.includes("inbox") || text.includes("📥")) return <FaInbox className="w-4 h-4" />;
    if (text.includes("campaign") || text.includes("ads")) return <FaBullhorn className="w-4 h-4" />;
    if (text.includes("contacts") || text.includes("👥")) return <FaAddressBook className="w-4 h-4" />;
    if (text.includes("settings") || text.includes("⚙️") || text.includes("settings")) return <FaCog className="w-4 h-4" />;
    if (text.includes("academics") || text.includes("📚") || text.includes("calendar")) return <FaCalendarAlt className="w-4 h-4" />;
    if (text.includes("profile") || text.includes("🧑‍💻")) return <FaUserCircle className="w-4 h-4" />;
    // default
    return <FaClipboardList className="w-4 h-4" />;
  }

  // Remove emojis from label text
  function cleanLabel(label: string) {
    return label.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
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
      className={`fixed md:sticky top-0 left-0 w-72 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white z-40 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 flex flex-col shadow-2xl`}
    >
      {/* Mobile close */}
      <div className="md:hidden flex justify-end p-4">
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <ul className="space-y-1">
          {links.map((section, idx) => (
            <li key={section.label}>
              {idx > 0 && <div className="my-3 border-t border-gray-700/30" />}
              
              {/* Section */}
              {section.children ? (
                <>
                  <button
                    onClick={() => toggle(section.label)}
                    className={`w-full flex items-center justify-between transition-all duration-200 group ${
                      expanded.has(section.label)
                        ? "px-4 py-3 text-base font-semibold bg-gray-700/60 rounded-lg text-white shadow-inner"
                        : "px-4 py-2.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        {getIconForLabel(section.label)}
                      </span>
                      <span className={`${expanded.has(section.label) ? 'text-white' : 'text-gray-300'}`}>{cleanLabel(section.label)}</span>
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${expanded.has(section.label) ? 'rotate-180 text-white' : 'text-gray-300'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expanded.has(section.label) && (
                    <ul className="ml-3 mt-1 space-y-1 border-l-2 border-gray-700/30 pl-3">
                      {section.children.map(child =>
                        child.children ? (
                          <li key={child.label}>
                            <button
                              onClick={() => toggle(child.label)}
                              className={`w-full flex items-center justify-between transition-all duration-150 ${
                                expanded.has(child.label)
                                  ? 'px-3 py-2.5 text-sm bg-gray-700/50 text-white rounded-md'
                                  : 'px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-md'
                              }`}
                            >
                              <span className="flex items-center gap-2">{getIconForLabel(child.label)} <span>{cleanLabel(child.label)}</span></span>
                              <svg
                                className={`w-3 h-3 transition-transform duration-200 ${expanded.has(child.label) ? 'rotate-180 text-white' : 'text-gray-400'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {expanded.has(child.label) && (
                              <ul className="ml-3 mt-1 space-y-1 border-l border-gray-700/30 pl-3">
                                {child.children.map(grand => (
                                  <li key={grand.label}>
                                    <Link
                                      href={buildHref(grand.href!)}
                                      onClick={handleClick}
                                      className={`block px-3 py-2 text-sm rounded-md transition-all duration-150 ${
                                        isActive(grand.href)
                                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg shadow-blue-500/30"
                                          : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                                      }`}
                                    >
                                      <span className="flex items-center gap-2">{getIconForLabel(grand.label)} <span>{cleanLabel(grand.label)}</span></span>
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
                              className={`block px-3 py-2 text-sm rounded-md transition-all duration-150 ${
                                isActive(child.href)
                                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg shadow-blue-500/30"
                                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                              }`}
                            >
                              <span className="flex items-center gap-2">{getIconForLabel(child.label)} <span>{cleanLabel(child.label)}</span></span>
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
                  className={`flex items-center gap-3 px-4 transition-all duration-200 group ${
                    isActive(section.href)
                      ? "py-3 text-base bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg shadow-blue-500/30 rounded-lg"
                      : "py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg"
                  }`}
                >
                  <span className="text-gray-300 group-hover:text-white transition-colors">{getIconForLabel(section.label)}</span>
                  <span className={`${isActive(section.href) ? 'text-white' : 'text-gray-300'}`}>{cleanLabel(section.label)}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700/50 backdrop-blur-sm bg-gray-900/50">
        <Logout_Button />
      </div>
    </aside>
  );
}
