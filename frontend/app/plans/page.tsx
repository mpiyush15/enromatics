import SubscribePlans from "../../components/plans/SubscribePlans";

export default function SubscriptionPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Choose a Plan</h1>
      <SubscribePlans />
    </div>
  );
}