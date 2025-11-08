"use client";

import { signOut } from "next-auth/react";

export default function Logout_Button() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })} //
      className="w-full px-4 py-2 mt-6 bg-red-600 rounded hover:bg-red-700 transition"
    >
      🚪 Logout
    </button>
  );
}