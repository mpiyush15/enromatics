import { useState } from "react";
import { api, safeApiCall } from "@/lib/apiClient";

export function useSendSubscriptionNotification() {
  const [loading, setLoading] = useState(false);

  const sendNotification = async (tenantId: string) => {
    setLoading(true);
    try {
      console.log('📮 Sending notification for tenant:', tenantId);
      const [data, err] = await safeApiCall(() =>
        api.post("/api/subscription-notifications/send-expiry-notification", {
          tenantId,
        })
      );

      if (err) {
        console.error('❌ Error sending notification:', err);
        return { success: false, message: err.message || "Failed to send notification" };
      }

      if (data?.success) {
        console.log('✅ Notification sent successfully');
        return { success: true, message: `✅ Notification sent!` };
      } else {
        console.error('❌ API error:', data?.message);
        return { success: false, message: data?.message || "Failed to send notification" };
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      return { success: false, message: error.message || "Error sending notification" };
    } finally {
      setLoading(false);
    }
  };

  return { sendNotification, loading };
}
