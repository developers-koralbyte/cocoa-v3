// StatsCard.tsx
import React from "react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  color: string;
  /**
   * A number between 0 and 100 that controls the ring fill
   */
  percentage: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  color,
  percentage,
}) => {
  // Clamp percentage between [0, 100].
  const clamped = Math.max(0, Math.min(100, percentage));

  // This circle's radius is 40 in a 100x100 viewBox => circumference ~ 251.2
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 flex items-center gap-6 w-70">
      {/* Left Text Section */}
      <div>
        <h4 className="pb-3 text-sm font-semibold">{title}</h4>
        <p className="pb-2 text-xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      {/* Right progress ring */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Background circle */}
        <svg viewBox="0 0 100 100" className="absolute w-full h-full">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e2e2e2"
            strokeWidth="10"
            fill="none"
          />
        </svg>

        {/* Foreground circle: rotate to start at top (-90deg) */}
        <svg
          viewBox="0 0 100 100"
          className="absolute w-full h-full rotate-[-90deg]"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={
              circumference - (circumference * clamped) / 100
            }
            strokeLinecap="round"
          />
        </svg>

        {/* Text in the center */}
        <span className="relative text-xs font-semibold">
          {Math.round(clamped)}%
        </span>
      </div>
    </div>
  );
};

export default StatsCard;
