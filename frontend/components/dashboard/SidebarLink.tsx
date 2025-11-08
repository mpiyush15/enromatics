// This file contains the sidebar links mapping for the dashboard.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // optional

interface SidebarLinkProps {
  href: string;
  icon?: string;
  label: string;
}

export default function SidebarLink({ href, icon, label }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-2 rounded transition font-medium",
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-700 text-white hover:bg-blue-500"
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </Link>
  );
}