import clientPromise from "@/lib/db";
import AnalyticsCard from "@/components/dashboard/home/AnalyticsCard";

export default async function AdminOverview() {
  const client = await clientPromise;
  const db = client.db("forteStudioz");

  const userCount = await db.collection("users").countDocuments();
  const leadCount = await db.collection("lead").countDocuments();
  const courseCount = await db.collection("subscriptions").countDocuments();
  const revenue = 12000; // Replace with actual logic if available

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📊 Admin Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">
            Here you can view the overall statistics of Forte Studioz.
        </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <AnalyticsCard label="Total Users" value={userCount} icon="👤" />
        <AnalyticsCard label="Total Leads" value={leadCount} icon="📋" />
        <AnalyticsCard label="Subscription Plans" value={courseCount || 0} icon="🎓" />
        <AnalyticsCard label="Revenue" value={`₹${revenue}`} icon="💰" />
      </div>

        {/* Scheduled Posts Table */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">📅 Scheduled Posts</h2>
        <table className="w-full border border-gray-300 rounded overflow-hidden text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Platform</th>
              <th className="p-2 border">Content</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Acme Corp</td>
              <td className="p-2 border">2025-06-01</td>
              <td className="p-2 border">Instagram</td>
              <td className="p-2 border">Summer Sale Post</td>
              <td className="p-2 border text-green-600">Scheduled</td>
            </tr>
            <tr>
              <td className="p-2 border">Beta Ltd</td>
              <td className="p-2 border">2025-06-03</td>
              <td className="p-2 border">Facebook</td>
              <td className="p-2 border">Product Launch</td>
              <td className="p-2 border text-yellow-600">Pending</td>
            </tr>
            <tr>
              <td className="p-2 border">Gamma Inc</td>
              <td className="p-2 border">2025-06-05</td>
              <td className="p-2 border">LinkedIn</td>
              <td className="p-2 border">Hiring Announcement</td>
              <td className="p-2 border text-green-600">Scheduled</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}