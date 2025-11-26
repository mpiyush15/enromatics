// app/subscribe/[planId]/page.tsx
import { plans } from "@/data/plans";
import SubscriptionForm from "./form/page"; // Adjust the import path as necessary

type Props = {
  params: Promise<{ planId: string }>; // ✅ Now a Promise
};

export default async function SubscriptionPage({ params }: Props) {
  const { planId } = await params; // ✅ Await the params
  const plan = plans.find((p) => p.planId === planId);

  if (!plan) return <div className="p-6">❌ Plan not found</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Plan Info */}
      <div className="md:w-1/2 w-full bg-blue-100 dark:bg-gray-800 p-8 text-black dark:text-white">
  <h1 className="text-2xl font-semibold mb-4">{plan.title}</h1>
        <p className="text-2xl font-semibold mb-2">₹{plan.price}</p>
        <p className="mb-4">{plan.description}</p>
        <ul className="list-disc ml-5 text-sm space-y-1">
          {plan.features?.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      {/* Right: Form */}
      <div className="md:w-1/2 w-full flex items-center justify-center bg-white dark:bg-gray-900 p-6">
        <SubscriptionForm
          planName={plan.planName}
          price={plan.price}
          planId={plan.planId}
        />
      </div>
    </div>
  );
}
