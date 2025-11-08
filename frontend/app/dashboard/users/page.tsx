import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Session } from "next-auth";

type AppUser = {
  _id: ObjectId;
  username: string;
  email: string;
  role: string;
  plan?: string;
  subscribed?: boolean;
};

export default async function AdminUsersPage() {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  const client = await clientPromise;
  const db = client.db("forteStudioz");
  const users = await db
    .collection<AppUser>("users")
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👥 All Users</h1>
      <table className="w-full border border-gray-600 rounded">
        <thead className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-left">
          <tr>
            <th className="p-2">Username</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Plan</th>
            <th className="p-2">Subscribed</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id.toString()} className="border-t border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="p-2">{user.username}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2 font-medium text-blue-600">{user.role}</td>
              <td className="p-2">{user.plan || "-"}</td>
              <td className="p-2">{user.subscribed ? "✅ Yes" : "❌ No"}</td>
              <td className="p-2">
                 <a
                   href={`/dashboard/users/${user._id}/stats`}
                   className="text-blue-600 underline"
                  >
                   Update Stats
                    </a>      
            </td>   
              <td>
              
            </td>

            </tr>
          ))}
        </tbody>
        
      </table>
    </div>
  );
}