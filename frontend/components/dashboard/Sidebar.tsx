"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useOptionalAuth from "@/hooks/useOptionalAuth";
import Logout_Button from "@/app/dashboard/LogoutButton";
import useSWR from "swr";

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

  /* ------------------------ AUTO EXPAND ACTIVE ------------------------ */
  useEffect(() => {
    if (!pathname || !user) return;
    if (links.length === 0) return;

    const open = new Set<string>();

    // Build href locally to avoid dependency issues
    const buildHrefLocal = (href: string) => {
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

    const walk = (items: SidebarLink[], parents: string[] = []) => {
      for (const item of items) {
        if (item.href && pathname === buildHrefLocal(item.href)) {
          parents.forEach(p => open.add(p));
        }
        if (item.children) {
          walk(item.children, [...parents, item.label]);
        }
      }
    };

    walk(links);
    setExpanded(open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user?.tenantId, user?.role]);

  /* ------------------------ HELPERS ------------------------ */
  // All tenant roles including all staff role types
  const TENANT_ROLES = ["tenantAdmin", "admin", "staff", "employee", "teacher", "manager", "counsellor", "adsManager", "accountant", "marketing"];

  // Debug: Log user state
  console.log("🔍 Sidebar render - User:", user?.email, "Role:", user?.role, "TenantID:", user?.tenantId, "Loading:", loading);

  function buildHref(href: string) {
    if (href.includes("/client/")) return href;
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
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {section.label}
                    </span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${expanded.has(section.label) ? 'rotate-180' : ''}`}
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
                              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-md transition-all duration-150"
                            >
                              <span>{child.label}</span>
                              <svg 
                                className={`w-3 h-3 transition-transform duration-200 ${expanded.has(child.label) ? 'rotate-180' : ''}`}
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
                                      {grand.label}
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
                              {child.label}
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
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                    isActive(section.href)
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg shadow-blue-500/30"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive(section.href) ? 'bg-white' : 'bg-blue-400 opacity-0 group-hover:opacity-100'} transition-opacity`} />
                  {section.label}
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
