interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  showPercent = true,
  className = '',
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-500">{label}</span>}
          {showPercent && (
            <span className="text-xs font-medium text-gray-700">{pct}%</span>
          )}
        </div>
      )}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-electric rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
