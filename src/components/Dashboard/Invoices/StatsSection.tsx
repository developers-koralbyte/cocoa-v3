// StatsSection.tsx

import React from "react";
import StatsCard from "./StatsCard";

interface StatsSectionProps {
  // e.g. "18500" for $18,500 outstanding
  balanceOutstanding: string;
  // e.g. "32000" for $32,000 total issued
  issuedBalance: string;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  balanceOutstanding,
  issuedBalance,
}) => {
  // Convert string props to numbers
  const boNumber = parseFloat(balanceOutstanding) || 0;
  const ibNumber = parseFloat(issuedBalance) || 0;

  // You can tweak the descriptions / labels as you like
  const stats = [
    {
      title: "Oustanding Balance",
      value: `$${boNumber.toLocaleString()}`,
      description: "Unpaid invoice amounts",
      color: "#8664C6",
      percentage: 0, // or any logic for the donut ring
    },
    {
      title: "Issued Balance",
      value: `$${ibNumber.toLocaleString()}`,
      description: "Total of all invoices issued",
      color: "#D97C4A",
      percentage: 0,
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
