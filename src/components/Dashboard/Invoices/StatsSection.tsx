// StatsSection.tsx
import React from "react";
import StatsCard from "./StatsCard";

interface StatsSectionProps {
  totalSales: string;       // e.g. "20400" if you want $20.4k
  todayRevenue: string;     // e.g. "8200" if you want $8.2k
  inEscrow: string;         // e.g. "18200" if you want $18.2k
}

const StatsSection: React.FC<StatsSectionProps> = ({
  totalSales,
  todayRevenue,
  inEscrow,
}) => {
  // Convert strings to numbers so we can do math
  const salesNumber = parseFloat(totalSales) || 0;
  const revenueNumber = parseFloat(todayRevenue) || 0;
  const escrowNumber = parseFloat(inEscrow) || 0;


  const dailyGoal = 50000;
  const salesPercentage = (salesNumber / dailyGoal) * 100;
  const revenuePercentage = (revenueNumber / dailyGoal) * 100;
  const escrowPercentage = (escrowNumber / dailyGoal) * 100;

  const stats = [
    {
      title: "Today's Sales",
      value: `$${(salesNumber / 1000).toFixed(1)}k`,
      description: "We have sold 123 items.",
      color: "#8664C6",
      percentage: salesPercentage,
    },
    {
      title: "Today's Revenue",
      value: `$${(revenueNumber / 1000).toFixed(1)}k`,
      description: "Available to payout",
      color: "#D97C4A",
      percentage: revenuePercentage,
    },
    {
      title: "In Escrow",
      value: `$${(escrowNumber / 1000).toFixed(1)}k`,
      description: "Pending payments.",
      color: "#3DBA56",
      percentage: escrowPercentage,
    },
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
