import React from "react";
import StatsCard from "./StatsCard";

interface StatsSectionProps {
  totalSales: string;
  todayRevenue: string;
  inEscrow: string;
}

const StatsSection: React.FC<StatsSectionProps> = ({ totalSales, todayRevenue, inEscrow }) => {
  const stats = [
    { title: "Today's Sales", value: "$"+totalSales, description: "Total sales today.", color: "#8664C6" },
    { title: "Today's Revenue", value: "$"+todayRevenue, description: "Available to payout", color: "#D97C4A" },
    { title: "In Escrow", value: "$"+inEscrow, description: "Pending payments.", color: "#3DBA56" }
  ];

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsSection;
