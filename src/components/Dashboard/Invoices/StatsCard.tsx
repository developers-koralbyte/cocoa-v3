import React from "react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, color }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 flex items-center gap-6 w-70 ">
      <div>
        <h4 className="pb-3 text-sm font-semibold">{title}</h4>
        <p className="pb-2 text-xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <div className="w-10 h-10 bg-white rounded-full"></div>
      </div>
      
    </div>
  );
};

export default StatsCard;
