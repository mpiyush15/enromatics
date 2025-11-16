"use client";

export default function LogoutButton() {
  const handleLogout = () => {
    // 🔥 Clear everything related to JWT/session
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("tenantId");

    // Optional: if using cookie-based JWT later, call logout API here
    // await fetch("`${API_BASE_URL}/api/auth/logout`", { method: "POST", credentials: "include" });

    // Redirect to login
    window.location.href = "/login"; // full reload to reset React state
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 mt-6 bg-red-600 rounded hover:bg-red-700 transition"
    >
      🚪 Logout
    </button>
  );
}
