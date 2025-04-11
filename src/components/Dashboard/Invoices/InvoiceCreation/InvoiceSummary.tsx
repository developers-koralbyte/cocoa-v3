import React, { useState, useEffect } from 'react';
import { BsReplyAll } from 'react-icons/bs';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
}

interface Totals {
  total: number;
}

interface InvoiceSummaryProps {
  invoiceData: InvoiceData;
  totals: Totals;
  onInvoiceDataChange: (fieldName: string, value: string) => void;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  invoiceData,
  totals,
  onInvoiceDataChange,
}) => {
  const [paymentTerm, setPaymentTerm] = useState('30 days');

  useEffect(() => {
    const baseDate = new Date(invoiceData.invoiceDate);
    const newDate = new Date(baseDate);

    switch (paymentTerm) {
      case '1 week':
        newDate.setDate(baseDate.getDate() + 7);
        break;
      case '30 days':
        newDate.setDate(baseDate.getDate() + 30);
        break;
      case '60 days':
        newDate.setDate(baseDate.getDate() + 60);
        break;
      case 'Today':
      default:
        // "Today" means no extra days
        break;
    }

    const formattedDueDate = newDate.toISOString().split('T')[0];

    // Only update parent if we actually have a new due date
    if (invoiceData.dueDate !== formattedDueDate) {
      onInvoiceDataChange('dueDate', formattedDueDate);
    }
  }, [
    paymentTerm,
    invoiceData.invoiceDate,
    invoiceData.dueDate,
    onInvoiceDataChange,
  ]);

  return (
    <div className="sm:p-6 md:p-1">
      <h2 className="text-[35px] font-nunito font-semibold text-[#8B85C1] mb-2">
        Summary
      </h2>

      {/* Invoice Number */}
      <div className="bg-[#F8F5F5] p-3 rounded-md mb-[0.20rem] flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
           Number
        </span>
        <span className="text-base sm:text-lg font-semibold">
          {invoiceData.invoiceNumber}
        </span>
      </div>

      {/* Invoice Issue Date */}
      <div className="bg-[#F8F5F5] p-3 rounded-md mb-[0.20rem] flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
           Issue Date
        </span>
        <span className="text-base sm:text-lg font-semibold">
          {invoiceData.invoiceDate}
        </span>
      </div>

      {/* Payment Term Dropdown */}
      <div className="bg-[#F8F5F5] p-3 rounded-md mb-[0.20rem] flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
          Payment Term
        </span>
        <select
          className="p-2 border rounded-[1.5rem] text-base sm:text-lg"
          value={paymentTerm}
          onChange={(e) => setPaymentTerm(e.target.value)}
        >
          <option value="Today">Due on receipt</option>
          <option value="1 week">1 week</option>
          <option value="30 days">30 days</option>
          <option value="60 days">60 days</option>
        </select>
      </div>

      {/* Invoice Due Date (live-updating) */}
      <div className="bg-[#F8F5F5] p-3 rounded-md mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
           Due Date
        </span>
        <span className="text-base sm:text-lg font-semibold">
          {invoiceData.dueDate}
        </span>
      </div>

      {/* Invoice Amount */}
      <div className="bg-[#F8F5F5] p-3 rounded-md mb-1 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
           Amount
        </span>
        <span className="text-base sm:text-lg font-semibold">
          CAD {totals.total.toFixed(2)}
        </span>
      </div>

      {/* Additional info placeholders... */}
      <div className="bg-[#F8F5F5] p-3 rounded-md mb-[0.20rem] flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <span className="text-[#000000] font-nunito font-semibold flex items-center mb-2 sm:mb-0">
           Location
          <svg
            className="w-4 h-4 ml-1 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 6a1 1 0 100-2 1 1 0 000 2zm0 3a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 000-2v-3a1 1 0 000-2H9z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <span className="text-base sm:text-lg font-semibold">Canada</span>
      </div>

      <div className="bg-[#F8F5F5] p-3 rounded-md mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
          Card Checkout
        </span>
        <span className="text-base sm:text-lg font-semibold text-[#701919]">
          Coming Soon
        </span>
      </div>

      <div className="bg-[#F8F5F5] p-3 rounded-md mb-[0.20rem] flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
          Instant Payout
        </span>
        <span className="text-base sm:text-lg font-semibold text-[#701919]">
          Coming Soon
        </span>
      </div>

      <div className="bg-[#F8F5F5] p-3 rounded-md mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
          Contract Upload
        </span>
        <span className="text-base sm:text-lg font-semibold text-[#701919]">
          Coming Soon
        </span>
      </div>
    </div>
  );
};

export default InvoiceSummary;
