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
  // We'll convert the percentage (0–100) into degrees for the conic gradient.
  const degrees = percentage * 3.6; // 100% => 360 degrees

  return (
    <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 flex items-center gap-6 w-70">
      {/* Left Text Section */}
      <div>
        <h4 className="pb-3 text-sm font-semibold">{title}</h4>
        <p className="pb-2 text-xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      {/* Right Donut Chart Section */}
      <div className="relative w-20 h-20">
        {/* Gray background circle */}
        <div className="absolute inset-0 rounded-full bg-gray-200" />

        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${color} ${degrees}deg, transparent 0deg)`,
          }}
        />

        {/* White circle in the middle to create the donut effect */}
        <div className="absolute inset-4 rounded-full bg-white" />
      </div>
    </div>
  );
};

export default StatsCard;
