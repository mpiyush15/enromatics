interface AnalyticsCardProps {
  label: string;
  value: number | string;
  icon?: string;
}

export default function AnalyticsCard({ label, value, icon }: AnalyticsCardProps) {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        {icon && <span className="mr-2">{icon}</span>} {label}
      </h3>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
}