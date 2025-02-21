import React from 'react';
import searchIcon from '../../../assets/icons/search.svg';
import downloadIcon from '../../../assets/icons/download.svg';
import deleteIcon from '../../../assets/icons/trash.svg';

interface VendorInvoice {
  id: string;
  vendorId: string;
  buyerId: string;
  status: string;  // e.g. 'Draft' | 'Sent, Unpaid' | 'Paid' | 'Cancelled'
  invoiceData: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    recipientName: string;
    items: Array<{
      id: number;
      description: string;
      quantity: number;
      rate: number;
      tax: number;
    }>;
    totals: {
      subtotal: number;
      tax: number;
      total: number;
    };
  };
}

interface InvoiceTableProps {
  invoices: VendorInvoice[];
  selectedInvoices: string[];
  onSelect: (id: string) => void;
  // Optional functions for additional actions
  onDownloadAll?: () => void;
  onDeleteSelected?: () => void;
  onSearch?: () => void;
}

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'Sent, Paid':
    case 'Paid':
      return 'bg-[#ECFDF3] text-[#027A48]';
    case 'Sent, Unpaid':
    case 'Unpaid':
      return 'bg-[#EFF8FF] text-[#175CD3]';
    case 'Cancelled':
      return 'bg-[#FEE4E2] text-[#B42318]';
    case 'Draft':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const VendorInvoiceTable = ({
  invoices,
  selectedInvoices,
  onSelect,
  onDownloadAll = () => {
    console.log('Download functionality not implemented yet');
  },
  onDeleteSelected = () => {
    console.log('Delete functionality not implemented yet');
  },
  onSearch = () => {
    console.log('Search functionality not implemented yet');
  },
}: InvoiceTableProps) => {
  return (
    <div>
      {/* Header with title and action buttons */}
      <div className="flex items-center mb-6 mt-4">
        <h2 className="text-[#8685C1] font-semibold text-2xl font-nunito pr-10">
          Invoices History
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onDownloadAll}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(124,119,193,0.3)] hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)] transition-shadow"
          >
            <img
              src={downloadIcon}
              alt="Download"
              className="w-[17.99px] h-[17.99px]"
            />
          </button>
          <button
            onClick={onDeleteSelected}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(124,119,193,0.3)] hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)] transition-shadow"
          >
            <img
              src={deleteIcon}
              alt="Delete"
              className="w-[17.99px] h-[17.99px]"
            />
          </button>
          <button
            onClick={onSearch}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(124,119,193,0.3)] hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)] transition-shadow"
          >
            <img
              src={searchIcon}
              alt="Search"
              className="w-[17.99px] h-[17.99px]"
            />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-t-[1.5rem] overflow-hidden shadow-[0_2px_10px_rgba(124,119,193,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#D9D9D9]">
                <th className="p-1 py-6 text-left font-nunito text-black w-14">
                  &nbsp;
                </th>
                <th className="p-2 text-left font-nunito text-black w-32">
                  Date
                </th>
                <th className="p-2 text-left font-nunito text-black w-32">
                  Invoice #
                </th>
                <th className="p-2 text-left font-nunito text-black w-[200px]">
                  Invoice Product Name
                </th>
                <th className="p-2 pl-20 text-left font-nunito text-black w-48">
                  Recipient
                </th>
                <th className="p-2 text-left font-nunito text-black w-48">
                  Service
                </th>
                <th className="p-2 text-left font-nunito text-black w-32">
                  Status
                </th>
                <th className="p-2 text-left font-nunito text-black w-32">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const { id, status, invoiceData } = invoice;
                // Fallback values in case of missing data
                const invoiceDate = invoiceData?.invoiceDate || 'N/A';
                const invoiceNumber = invoiceData?.invoiceNumber || 'N/A';
                const productName =
                  invoiceData?.items?.[0]?.description || 'N/A';
                const recipient = invoiceData?.recipientName || 'N/A';
                const service = 'N/A'; // Adjust if needed
                const amount =
                  invoiceData?.totals?.total != null
                    ? `CAD ${invoiceData.totals.total.toFixed(2)}`
                    : 'N/A';

                return (
                  <tr key={id} className="border-b border-[#E5E7EB]">
                    {/* Checkbox cell */}
                    <td className="p-4">
                      <div className="w-5 h-5 border border-[#D1D5DB] rounded flex items-center justify-center relative">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(id)}
                          onChange={() => onSelect(id)}
                          className="opacity-0 absolute cursor-pointer w-full h-full"
                        />
                        {selectedInvoices.includes(id) && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                              stroke="#7C77C1"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </td>

                    {/* Invoice date */}
                    <td className="p-4">{invoiceDate}</td>

                    {/* Invoice number */}
                    <td className="p-4">{invoiceNumber}</td>

                    {/* Product name */}
                    <td className="p-4">{productName}</td>

                    {/* Recipient */}
                    <td className="p-4">{recipient}</td>

                    {/* Service */}
                    <td className="p-4">{service}</td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusClasses(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-4">{amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorInvoiceTable;
