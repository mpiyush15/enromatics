import { plans } from "@/data/plans";
import PlanCard from "./PlanCard";

const SubscribePlans = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          id={plan.id}
          title={plan.title}
          price={plan.price}
          description={plan.description}
          features={plan.features}
          buttonLabel={plan.buttonLabel}
          
        />
      ))}
    </div>
  );
};

export default SubscribePlans;