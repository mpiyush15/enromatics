import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

type Lead = {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  institute: string;
  plan: string;
  createdAt: Date;
};

export default async function AdminLeadsPage() {
  const client = await clientPromise;
  const db = client.db("forteStudioz");
  const leads = await db.collection<Lead>("lead").find().sort({ createdAt: -1 }).toArray();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Leads Submitted</h1>
      <table className="w-full text-left border border-gray-300">
        <thead className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-left">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Institute</th>
            <th className="p-2 border">Plan</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id.toString()} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="p-2 border">{lead.name}</td>
              <td className="p-2 border">{lead.email}</td>
              <td className="p-2 border">{lead.phone}</td>
              <td className="p-2 border">{lead.institute}</td>
              <td className="p-2 border">{lead.plan}</td>
              <td className="p-2 border">{new Date(lead.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}