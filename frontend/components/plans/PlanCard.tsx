"use client";

import { useRouter } from "next/navigation";

type PlanCardProps = {
  title: string;
  price: string;
  description: string;
  id?: string;
  features?: string[];
  buttonLabel?: string;
};

export default function PlanCard({
  id,
  title,
  price,
  description,
  features,
  buttonLabel,
}: PlanCardProps) {
  const router = useRouter();

  const handleSubscribe = () => {
    // Redirect user to the subscribe form route
    router.push(`/subscribe/form?plan=${id}`);
  };

  return (
    <div className="border p-6 rounded shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-2xl font-semibold">₹{price}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 my-2">{description}</p>

      {features && (
        <ul className="text-sm text-gray-700 dark:text-gray-300 mb-4 list-disc list-inside">
          {features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
      )}

      <button
        onClick={handleSubscribe}
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded"
      >
        {buttonLabel || "Subscribe"}
      </button>
    </div>
  );
}