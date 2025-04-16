// File: BuyerInvoiceTable.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import searchIcon from '../../../assets/icons/search.svg';
import downloadIcon from '../../../assets/icons/download.svg';
import deleteIcon from '../../../assets/icons/trash.svg';
import filterIcon from '../../../assets/icons/filterIcon.svg';

// This import references the single-file InvoicePreview that has hideEditButton logic.
// Adjust the path as needed to where your InvoicePreview.tsx is located.
import InvoicePreview from '../Invoices/InvoiceCreation/InvoicePreview';

////////////////////////////
// Types / Interfaces
////////////////////////////

interface BuyerInvoiceItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  tax: number;
}

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
    items: BuyerInvoiceItem[];
    totals: {
      subtotal: number;
      tax: number;
      total: number;
    };
  };
}

interface BuyerInvoiceTableProps {
  invoices: BuyerInvoice[];
  selectedInvoices: string[];
  onSelect: (id: string) => void;
  onDownloadAll?: () => void;
  onDeleteSelected?: () => void;
  onSearch?: () => void;
}

////////////////////////////
// BuyerInvoiceTable
////////////////////////////

const BuyerInvoiceTable: React.FC<BuyerInvoiceTableProps> = ({
  invoices,
  selectedInvoices,
  onSelect,
  onDownloadAll = () => console.log('Download not implemented'),
  onDeleteSelected = () => console.log('Delete not implemented'),
  onSearch = () => console.log('Search not implemented'),
}) => {
  const navigate = useNavigate();

  // Whether to show the filter panel
  const [showFilters, setShowFilters] = React.useState(false);

  // Filter states
  const [issueDateFilter, setIssueDateFilter] = React.useState('');
  const [dueDateFilter, setDueDateFilter] = React.useState('');
  const [senderFilter, setSenderFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [amountMin, setAmountMin] = React.useState('');
  const [amountMax, setAmountMax] = React.useState('');

  // Which invoice row is expanded
  const [expandedInvoiceId, setExpandedInvoiceId] = React.useState<string | null>(null);

  //////////////////////////////////////////////
  // Filtering logic
  //////////////////////////////////////////////
  const filteredInvoices = React.useMemo(() => {
    let results = invoices.filter((inv) => {
      const { invoiceData, status } = inv;

      // Filter by issue date
      if (issueDateFilter && invoiceData.invoiceDate !== issueDateFilter) {
        return false;
      }

      // Filter by due date
      if (dueDateFilter && invoiceData.dueDate !== dueDateFilter) {
        return false;
      }

      // Filter by sender
      if (senderFilter) {
        const lowerSender = senderFilter.toLowerCase();
        const invSender = (invoiceData.senderName || '').toLowerCase();
        if (!invSender.includes(lowerSender)) {
          return false;
        }
      }

      // Filter by status
      if (statusFilter && statusFilter !== status) {
        return false;
      }

      // Filter by amount range
      const total = invoiceData.totals.total;
      if (amountMin && total < parseFloat(amountMin)) {
        return false;
      }
      if (amountMax && total > parseFloat(amountMax)) {
        return false;
      }

      return true;
    });

    // Sort descending by invoiceDate
    results.sort((a, b) => {
      const dateA = new Date(a.invoiceData.invoiceDate).getTime();
      const dateB = new Date(b.invoiceData.invoiceDate).getTime();
      return dateB - dateA;
    });

    return results;
  }, [
    invoices,
    issueDateFilter,
    dueDateFilter,
    senderFilter,
    statusFilter,
    amountMin,
    amountMax,
  ]);

  //////////////////////////////////////////////
  // Render
  //////////////////////////////////////////////
  return (
    <div>
      {/* Header with action buttons */}
      <div className="flex items-center mb-6 mt-4">
        <h2 className="text-[#8685C1] font-semibold text-2xl font-nunito pr-10">
          Invoices History
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onDownloadAll}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={downloadIcon} alt="Download" className="w-5 h-5" />
          </button>
          <button
            onClick={onDeleteSelected}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
          </button>
          <button
            onClick={onSearch}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={searchIcon} alt="Search" className="w-5 h-5" />
          </button>
          <button onClick={() => setShowFilters((prev) => !prev)}>
            <img
              src={filterIcon}
              alt="Filter"
              className="mt-2 w-[40.99px] h-[40.99px] bg-white rounded-full flex items-center justify-center"
            />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDateFilter}
              onChange={(e) => setIssueDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sender
            </label>
            <input
              type="text"
              placeholder="e.g. Vendor ABC"
              value={senderFilter}
              onChange={(e) => setSenderFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">-- Any --</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount
            </label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount
            </label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-t-[1.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-center font-nunito text-black w-14">&nbsp;</th>
                <th className="p-4 text-left font-nunito text-black w-32">
                  Issue Date
                </th>
                <th className="p-4 text-left font-nunito text-black w-32">
                  Due Date
                </th>
                <th className="p-4 text-left font-nunito text-black w-32">
                  Invoice #
                </th>
                <th className="p-4 pl-2 text-left font-nunito text-black w-[200px]">
                  Items Description
                </th>
                <th className="p-4 text-left font-nunito text-black w-48">
                  Sender
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
              {filteredInvoices.map((invoice) => {
                const { id, status, invoiceData } = invoice;
                const isSelected = selectedInvoices.includes(id);

                return (
                  <React.Fragment key={id}>
                    <tr
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        // Only toggle expansion if the user didn't click the checkbox
                        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                          return;
                        }
                        setExpandedInvoiceId((prev) => (prev === id ? null : id));
                      }}
                    >
                      <td className="p-4 text-center">
                        <div className="inline-block w-5 h-5 border border-[#7C77C1] rounded flex items-center justify-center relative">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelect(id)}
                            className="opacity-0 absolute cursor-pointer w-full h-full"
                          />
                          {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
                      <td className="p-4 text-sm">{invoiceData.invoiceDate || 'N/A'}</td>
                      <td className="p-4 text-sm">{invoiceData.dueDate || 'N/A'}</td>
                      <td className="p-4 text-sm">{invoiceData.invoiceNumber || 'N/A'}</td>
                      <td className="p-4 pl-2 text-sm">
                        {invoiceData.items
                          .map((item) => item.description)
                          .join(', ') || 'N/A'}
                      </td>
                      <td className="p-4 text-sm">{invoiceData.senderName || 'N/A'}</td>
                      {/* Status is read-only for buyer */}
                      <td className="p-4 text-sm">
                        <span
                          className="inline-block px-4 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor:
                              status === 'Paid'
                                ? '#87C66A9E'
                                : status === 'Unpaid'
                                ? '#8FDCE64F'
                                : status === 'Cancelled'
                                ? '#FD51517A'
                                : '#f3f4f6',
                            color: 'black',
                          }}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-sm">
                        {invoiceData.totals?.total != null
                          ? `CAD ${invoiceData.totals.total.toFixed(2)}`
                          : 'N/A'}
                      </td>
                    </tr>

                    {/* Expanded Row for preview */}
                    {expandedInvoiceId === id && (
                      <tr>
                        <td colSpan={8} className="bg-gray-50">
                          <div className="p-4">
                            {/* Here, we use InvoicePreview with hideEditButton={true} */}
                            <InvoicePreview
                              // Mapping buyer invoice data to the InvoicePreview fields
                              invoiceData={{
                                invoiceNumber: invoiceData.invoiceNumber,
                                invoiceDate: invoiceData.invoiceDate,
                                dueDate: invoiceData.dueDate,
                                companyName: '', // or fill if you store vendor info
                                companyEmail: '',
                                companyAddress: '',
                                companyLocation: '',
                                recipientName: '',
                                recipientPhone: '',
                                recipientEmail: '',
                                recipientAddress: '',
                                bankName: '',
                                bankAddress: '',
                                accountName: '',
                                iban: '',
                                bic: '',
                              }}
                              // Convert buyer items to the structure InvoicePreview expects
                              items={invoiceData.items.map((bItem) => ({
                                id: bItem.id,
                                description: bItem.description,
                                quantity: bItem.quantity,
                                price: bItem.rate, // or use bItem.rate if that's correct
                                tax: bItem.tax,
                              }))}
                              totals={{
                                subtotal: invoiceData.totals.subtotal,
                                tax: invoiceData.totals.tax,
                                total: invoiceData.totals.total,
                              }}
                              companyLogo={null} // pass a logo if you have one
                              isPreview={true}
                              onTogglePreview={() => setExpandedInvoiceId(null)}
                              hideEditButton={true} // <--- no Edit button for buyers
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BuyerInvoiceTable;
