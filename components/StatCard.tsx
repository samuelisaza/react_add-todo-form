interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-start gap-4">
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-electric/10 flex items-center justify-center text-electric flex-shrink-0">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
