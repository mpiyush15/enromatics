import FeatureCard from "./FeatureCards";
import { FaCalendarCheck, FaComments, FaChartLine } from "react-icons/fa";

export default function FeatureSection() {
  return (
    <section className="relative z-10 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
          Why Choose Forte Studioz?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<FaCalendarCheck />}
            title="Easy Content Calendar"
            description="Plan and track your social media campaigns with our intuitive content calendar."
          />
          <FeatureCard
            icon={<FaComments />}
            title="WhatsApp Engagement"
            description="Connect and automate WhatsApp messaging directly from your dashboard."
          />
          <FeatureCard
            icon={<FaChartLine />}
            title="Client Reports"
            description="Get automated analytics to measure performance and improve your reach."
          />
        </div>
      </div>
    </section>
  );
}