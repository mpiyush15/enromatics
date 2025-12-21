"use client";

import { useState, useEffect, useMemo } from "react";
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
  href?: string;
  label: string;
  children?: SidebarLink[];
}

// SWR fetcher for sidebar
const sidebarFetcher = async (url: string) => {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  if (data.success) {
    return data.sidebar;
  }
  throw new Error(data.message || "Failed to fetch sidebar");
};

export default function Sidebar({ isOpen, onClose, links: incomingLinks }: SidebarProps) {
  // If parent passed links (student dashboard) we should not force a redirect to admin login.
  const isExternalLinks = !!incomingLinks && incomingLinks.length > 0;
  const authHook = isExternalLinks ? useOptionalAuth() : useAuth();
  const { user, loading } = authHook;
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Use SWR for sidebar - 30 min cache, no refetch on focus
  const shouldFetch = !isExternalLinks && user && !loading;
  const { data: fetchedLinks, isLoading: loadingSidebar } = useSWR<SidebarLink[]>(
    shouldFetch ? `/api/ui/sidebar` : null,
    sidebarFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1800000, // 30 minutes cache
      revalidateIfStale: false,
    }
  );

  // Use incoming links if provided, otherwise use fetched links
  const links = isExternalLinks ? (incomingLinks || []) : (fetchedLinks || []);

  // Auto-expand sections with active children (supports 3-level nesting)
  useEffect(() => {
    if (links.length > 0) {
      links.forEach((link: SidebarLink) => {
        // Check for active direct children
        const hasActiveChild = link.children?.some((child: SidebarLink) => {
          const childHref = child.href || "#";
          if (childHref !== "#" && pathname?.startsWith(childHref)) return true;
          
          // Check for active grandchildren (3rd level)
          if (child.children) {
            return child.children.some((grandchild: SidebarLink) => {
              const grandchildHref = grandchild.href || "#";
              return grandchildHref !== "#" && pathname?.startsWith(grandchildHref);
            });
          }
          return false;
        });

        if (hasActiveChild) {
          setExpandedSections((prev) => {
            if (prev.has(link.label)) return prev;
            const newSet = new Set(prev);
            newSet.add(link.label);
            return newSet;
          });
        }

        // Also expand 2nd level if it has active grandchildren
        link.children?.forEach((child: SidebarLink) => {
          if (child.children) {
            const hasActiveGrandchild = child.children.some((grandchild: SidebarLink) => {
              const grandchildHref = grandchild.href || "#";
              return grandchildHref !== "#" && pathname?.startsWith(grandchildHref);
            });

            if (hasActiveGrandchild) {
              setExpandedSections((prev) => {
                if (prev.has(child.label)) return prev;
                const newSet = new Set(prev);
                newSet.add(child.label);
                return newSet;
              });
            }
          }
        });
      });
    }
  }, [links, pathname]);

  if (!isExternalLinks && loading) return <p className="text-white p-4">Loading...</p>;

  // ✅ If user is loaded but sidebar links are still loading, show empty sidebar (don't block)
  if (loadingSidebar && links.length === 0) {
    return (
      <aside className={`fixed md:static w-64 h-screen bg-gray-800 text-white z-40 transform transition-transform duration-300 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}>
        <div className="md:hidden flex justify-end p-4">
          <button onClick={onClose} className="text-xl">✕</button>
        </div>
        <div className="p-4">
          <p className="text-gray-400 text-sm">Loading sidebar...</p>
        </div>
      </aside>
    );
  }

  // ✅ Dynamically build hrefs (inject tenantId for tenant users)
  const buildHref = (href: string) => {
    // If href already contains /client/, it means backend already replaced [tenantId]
    if (href.includes('/client/')) {
      return href;
    }
    
    if (
      user?.tenantId &&
      user.role &&
      (user.role.startsWith("tenant") || user.role.endsWith("Manager")) &&
      href.startsWith("/dashboard")
    ) {
      const path = href.replace("/dashboard", "");
      return `/dashboard/client/${user.tenantId}${path}`;
    }
    return href;
  };

  const isActiveExact = (href: string) => {
    if (href === "#") return false;
    const builtHref = buildHref(href);
    
    // Exact match only - no startsWith logic
    // This prevents /students from being active when on /students/attendance
    return pathname === builtHref;
  };

  const hasActiveChild = (children: SidebarLink[]) => {
    return children.some(child => {
      const childHref = child.href || "#";
      return isActiveExact(childHref);
    });
  };

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  // Only close sidebar on mobile devices
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <aside
      className={`fixed md:sticky top-0 left-0 w-64 h-screen bg-gray-800 text-white z-40 transform transition-transform duration-300 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="md:hidden flex justify-end p-4">
        <button onClick={onClose} className="text-xl">✕</button>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto sidebar-scroll">
        <h2 className="text-xl font-bold">Dashboard</h2>
        {links.length === 0 && !loadingSidebar && (
          <p className="text-gray-400 text-sm">❌ No links available for your role: {user?.role}</p>
        )}
        <ul className="space-y-2">
          {links.map((link, idx) => (
            <li key={link.label}>
              {idx > 0 && <div className="border-t border-dashed border-gray-400/40 my-2" />}

              {link.children ? (
                <div>
                  <button
                    onClick={() => toggleSection(link.label)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold transition-colors rounded ${
                      // Never highlight the parent section button - only the active child link
                      "text-gray-300 hover:bg-gray-700/30"
                    }`}
                  >
                    <span>{link.label}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedSections.has(link.label) ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.has(link.label) && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {link.children.map((child) => {
                        // Check if child has its own children (3rd level nesting)
                        if (child.children && child.children.length > 0) {
                          return (
                            <li key={child.label}>
                              <button
                                onClick={() => toggleSection(child.label)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold transition-colors rounded ${
                                  "text-gray-300 hover:bg-gray-700/30"
                                }`}
                              >
                                <span>{child.label}</span>
                                <svg
                                  className={`w-3 h-3 transition-transform ${expandedSections.has(child.label) ? "rotate-180" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {expandedSections.has(child.label) && (
                                <ul className="ml-4 mt-1 space-y-1">
                                  {child.children.map((grandchild) => {
                                    const href = buildHref(grandchild.href || "#");
                                    const isActiveLink = isActiveExact(grandchild.href || "#");
                                    return (
                                      <li key={grandchild.label}>
                                        <Link
                                          href={href}
                                          onClick={handleLinkClick}
                                          className={`block px-3 py-2 text-sm rounded transition-colors ${
                                            isActiveLink
                                              ? "bg-blue-500 text-white font-medium shadow-sm"
                                              : "text-gray-300 hover:bg-gray-700/30 hover:text-white"
                                          }`}
                                          prefetch={false}
                                        >
                                          {grandchild.label}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        }
                        
                        // Regular 2nd level link
                        const href = buildHref(child.href || "#");
                        const isActiveLink = isActiveExact(child.href || "#");
                        return (
                          <li key={child.label}>
                            <Link
                              href={href}
                              onClick={handleLinkClick}
                              className={`block px-3 py-2 text-sm rounded transition-colors ${
                                isActiveLink
                                  ? "bg-blue-500 text-white font-medium shadow-sm"
                                  : "text-gray-300 hover:bg-gray-700/30 hover:text-white"
                              }`}
                              prefetch={false}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : (
                (() => {
                  const href = buildHref(link.href || "#");
                  const isActiveLink = isActiveExact(link.href || "#");
                  return (
                    <Link
                      href={href}
                      onClick={handleLinkClick}
                      className={`block px-4 py-2 rounded text-sm transition-colors ${
                        isActiveLink
                          ? "bg-blue-500 text-white font-medium shadow-sm"
                          : "text-gray-300 hover:bg-gray-700/30 hover:text-white"
                      }`}
                      prefetch={false}
                    >
                      {link.label}
                    </Link>
                  );
                })()
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button - Fixed at bottom */}
      <div className="p-4 mt-auto border-t border-gray-700 bg-gray-900">
        <Logout_Button />
      </div>
    </aside>
  );
}
