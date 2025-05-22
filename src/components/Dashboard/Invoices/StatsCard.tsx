import React from "react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  color,
}) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 w-70">
      {/* Card Content */}
      <div>
        <h4 className="pb-3 text-sm font-semibold">{title}</h4>
        <p className="pb-2 text-xl font-bold" style={{ color }}>{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default StatsCard;