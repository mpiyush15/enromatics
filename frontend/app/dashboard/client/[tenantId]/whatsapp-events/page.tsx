"use client";

import { useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import WhatsAppEventsSettings from "@/components/settings/WhatsAppEventsSettings";

export default function WhatsAppEventsPage() {
  const params = useParams<{ tenantId: string }>();
  const tenantId = params?.tenantId;
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📱 WhatsApp Events Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure automated WhatsApp messages for student events
          </p>
        </div>

        {/* WhatsApp Events Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <WhatsAppEventsSettings tenantId={tenantId} />
        </div>
      </div>
    </div>
  );
}
