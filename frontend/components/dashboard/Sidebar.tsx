"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useOptionalAuth from "@/hooks/useOptionalAuth";
import Logout_Button from "@/app/dashboard/LogoutButton";
import { API_BASE_URL } from "@/lib/apiConfig";

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

export default function Sidebar({ isOpen, onClose, links: incomingLinks }: SidebarProps) {
  // If parent passed links (student dashboard) we should not force a redirect to admin login.
  const isExternalLinks = !!incomingLinks && incomingLinks.length > 0;
  const authHook = isExternalLinks ? useOptionalAuth() : useAuth();
  const { user, loading } = authHook;
  const pathname = usePathname();
  const [links, setLinks] = useState<SidebarLink[]>([]);
  const [loadingSidebar, setLoadingSidebar] = useState(true);

  useEffect(() => {
    const fetchSidebar = async () => {
      // If links are provided by parent (student dashboard), use them immediately and skip auth/user checks
      if (isExternalLinks) {
        setLinks(incomingLinks || []);
        setLoadingSidebar(false);
        return;
      }

      // Only fetch if user exists AND is not loading
      if (!user || loading) {
        console.log("⏳ Skipping fetch - user not ready:", { userExists: !!user, loading });
        return;
      }

      try {
        console.log("🔄 Fetching sidebar for user:", { role: user.role, tenantId: user.tenantId });
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${API_BASE_URL}`}/api/ui/sidebar`, {
          method: "GET",
          credentials: "include", // ✅ Sends httpOnly cookie automatically
        });

        const data = await res.json();
        console.log("🔍 Sidebar response:", data);
        
        if (data.success) {
          console.log("✅ Sidebar links received:", data.sidebar.length, "items");
          setLinks(data.sidebar);
        } else {
          console.error("❌ Sidebar response not successful:", data);
        }
      } catch (err) {
        console.error("❌ Sidebar fetch error:", err);
      } finally {
        setLoadingSidebar(false);
      }
    };

    fetchSidebar();
  }, [user, loading]);

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

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <aside
      className={`fixed md:sticky top-0 left-0 w-64 h-screen bg-gray-800 text-white z-40 transform transition-transform duration-300 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="md:hidden flex justify-end p-4">
        <button onClick={onClose} className="text-xl">✕</button>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
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
                  <div className="px-4 py-2 text-sm font-semibold text-gray-300">{link.label}</div>
                  <ul className="ml-4 mt-1 space-y-1">
                    {link.children.map((child) => {
                      const href = buildHref(child.href || "#");
                      const isActiveLink = isActive(href);
                      return (
                        <li key={child.label}>
                          <Link
                            href={href}
                            onClick={onClose}
                            className={`block px-3 py-2 text-sm rounded transition-colors ${
                              isActiveLink
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700/30 hover:text-white"
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                (() => {
                  const href = buildHref(link.href || "#");
                  const isActiveLink = isActive(href);
                  return (
                    <Link
                      href={href}
                      onClick={onClose}
                      className={`block px-4 py-2 rounded text-sm transition-colors ${
                        isActiveLink
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700/30 hover:text-white"
                      }`}
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

      <div className="p-4 mt-auto border-t border-gray-700">
        <Logout_Button />
      </div>
    </aside>
  );
}
