import React from 'react';
import searchIcon from '../../../assets/icons/search.svg';
import downloadIcon from '../../../assets/icons/download.svg';
import deleteIcon from '../../../assets/icons/trash.svg';

interface BuyerInvoice {
  id: string;
  vendorId: string;
  buyerId: string;
  status: 'Paid' | 'Unpaid' | 'Cancelled';
  invoiceData: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    senderName: string;
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
  invoices: BuyerInvoice[];
  selectedInvoices: string[];
  onSelect: (id: string) => void;
  // Optional functions for additional actions
  onDownloadAll?: () => void;
  onDeleteSelected?: () => void;
  onSearch?: () => void;
}

// Function to get the status background color
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Paid':
      return { backgroundColor: '#87C66A9E' }; // Green with 62% opacity
    case 'Unpaid':
      return { backgroundColor: '#8FDCE64F' }; // Light green with 31% opacity
    case 'Cancelled':
      return { backgroundColor: '#FD51517A' }; // Red with 48% opacity
    default:
      return { backgroundColor: '#f3f4f6' }; // Default gray
  }
};

const InvoiceTable = ({
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
              <tr className="bg-[#E8E6F2]">
                <th className="p-4 text-center font-nunito text-black w-14">
                  &nbsp;
                </th>
                <th className="p-4 text-left font-nunito text-black w-32">
                  Date
                </th>
                <th className="p-4 text-left font-nunito text-black w-32">
                  Invoice #
                </th>
                <th className="p-4 pl-2 text-left font-nunito text-black w-[200px]">
                  Invoice Product Name
                </th>
                <th className="p-4 pl-6 text-left font-nunito text-black w-48">
                  Sender
                </th>
                <th className="p-4 text-left font-nunito text-black w-48">
                  Service
                </th>
                <th className="p-4 text-left font-nunito text-black w-32">
                  Status
                </th>
                <th className="p-4 text-left font-nunito text-black w-32">
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
                const sender = invoiceData?.senderName || 'N/A';
                const service = 'N/A'; // Adjust if needed
                const amount =
                  invoiceData?.totals?.total != null
                    ? `CAD ${invoiceData.totals.total.toFixed(2)}`
                    : 'N/A';

                return (
                  <tr key={id} className="border-b border-[#E5E7EB] hover:bg-gray-50">
                    {/* Checkbox cell */}
                    <td className="p-4 text-center">
                      <div className="inline-block w-5 h-5 border border-[#7C77C1] rounded flex items-center justify-center relative">
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
                    <td className="p-4 text-sm">{invoiceDate}</td>

                    {/* Invoice number */}
                    <td className="p-4 text-sm">{invoiceNumber}</td>

                    {/* Product name */}
                    <td className="p-4 pl-2 text-sm">{productName}</td>

                    {/* Sender */}
                    <td className="p-4 pl-6 text-sm">{sender}</td>

                    {/* Service */}
                    <td className="p-4 text-sm">{service}</td>

                    {/* Status - read-only for buyers */}
                    <td className="p-4">
                      <span
                        className="inline-block px-4 py-1 rounded-full text-sm font-medium"
                        style={{
                          ...getStatusStyle(status),
                          color: "black"
                        }}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-4 font-medium text-sm">{amount}</td>
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

export default InvoiceTable;