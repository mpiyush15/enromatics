import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { sidebarLinks } from "@/data/sidebarLinks";
import Logout_Button from "@/app/dashboard/LogoutButton";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session, status } = useSession();
  const role = session?.user?.role || "user";
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (status === "loading") return null;

  return (
    <aside
      className={`fixed md:static w-64 h-screen bg-gray-800 text-white z-40 transform transition-transform duration-300 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      {/* Close button (Mobile Only) */}
      <div className="md:hidden flex justify-end p-4">
        <button onClick={onClose} className="text-xl">✕</button>
      </div>

      {/* Sidebar Content */}
      <div className="p-4 space-y-6 flex-1">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <ul className="space-y-2">
          {sidebarLinks
            .filter((link) => link.roles.includes(role))
            .map((link) => (
              <li key={link.label}>
                {link.children ? (
                  <div>
                    <button
                      className="w-full flex justify-between items-center px-4 py-2 rounded bg-gray-700 hover:bg-blue-600 transition-all"
                      onClick={() =>
                        setOpenDropdown(openDropdown === link.label ? null : link.label)
                      }
                    >
                      <span>{link.label}</span>
                      <span>{openDropdown === link.label ? "▲" : "▼"}</span>
                    </button>
                    {openDropdown === link.label && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block px-3 py-1 rounded bg-gray-700 hover:bg-blue-600 text-sm transition-all"
                              onClick={onClose}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="block px-4 py-2 rounded bg-gray-700 hover:bg-blue-600 transition-all"
                    onClick={onClose}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
        </ul>
      </div>

      {/* Logout Button at bottom */}
      <div className="p-4 mt-auto border-t border-gray-700">
        <Logout_Button />
      </div>
    </aside>
  );
}