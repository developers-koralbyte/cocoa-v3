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
  price: number; // Change this from 'rate' to 'price' to match Firebase
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
    companyName: string;
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

  // Responsive state
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 640);
  const [isTablet, setIsTablet] = React.useState(
    window.innerWidth > 640 && window.innerWidth <= 1024
  );

  // Handle responsive breakpoints
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 640);
      setIsTablet(width > 640 && width <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        const invSender = (invoiceData.companyName || '').toLowerCase();
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

  // Get status badge styles
  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = "inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
    
    switch (status) {
      case 'Paid':
        return `${baseStyle} bg-green-100 text-green-800`
      case 'Unpaid':
        return `${baseStyle} bg-yellow-100 text-yellow-800`
      case 'Cancelled':
        return `${baseStyle} bg-red-100 text-red-800`
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`
    }
  }

  // Mobile card component
  const MobileInvoiceCard = ({ invoice }: { invoice: BuyerInvoice }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      {/* Header with checkbox and status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="inline-block w-5 h-5 border border-[#7C77C1] rounded flex items-center justify-center relative">
            <input
              type="checkbox"
              checked={selectedInvoices.includes(invoice.id)}
              onChange={() => onSelect(invoice.id)}
              className="opacity-0 absolute cursor-pointer w-full h-full"
            />
            {selectedInvoices.includes(invoice.id) && (
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
          <h3 className="font-semibold text-sm">
            {invoice.invoiceData.invoiceNumber || 'N/A'}
          </h3>
        </div>
        <span className={getStatusBadgeStyle(invoice.status)}>
          {invoice.status}
        </span>
      </div>

      {/* Invoice details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">From:</span>
          <span className="font-medium">{invoice.invoiceData.companyName || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Issue Date:</span>
          <span>{invoice.invoiceData.invoiceDate || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Due Date:</span>
          <span>{invoice.invoiceData.dueDate || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold">
            {invoice.invoiceData.totals?.total != null
              ? `CAD ${invoice.invoiceData.totals.total.toFixed(2)}`
              : 'N/A'}
          </span>
        </div>
      </div>

      {/* Items description */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-600 mb-1">Items:</p>
        <p className="text-sm">
          {invoice.invoiceData.items
            .map((item) => item.description)
            .join(', ') || 'N/A'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => setExpandedInvoiceId(
            expandedInvoiceId === invoice.id ? null : invoice.id
          )}
          className="text-[#7C77C1] text-sm font-medium"
        >
          {expandedInvoiceId === invoice.id ? 'Hide Preview' : 'View Preview'}
        </button>
      </div>

      {/* Expanded preview */}
      {expandedInvoiceId === invoice.id && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <InvoicePreview
            // Mapping buyer invoice data to the InvoicePreview fields
            invoiceData={{
              invoiceNumber: invoice.invoiceData.invoiceNumber,
              invoiceDate: invoice.invoiceData.invoiceDate,
              dueDate: invoice.invoiceData.dueDate,
              companyName: invoice.invoiceData.companyName,
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
            items={invoice.invoiceData.items.map((bItem) => ({
              id: bItem.id,
              description: bItem.description,
              quantity: bItem.quantity,
              price: bItem.price,
              tax: bItem.tax,
            }))}
            totals={{
              subtotal: invoice.invoiceData.totals.subtotal,
              tax: invoice.invoiceData.totals.tax,
              total: invoice.invoiceData.totals.total,
            }}
            companyLogo={null}
            isPreview={true}
            onTogglePreview={() => setExpandedInvoiceId(null)}
            hideEditButton={true}
          />
        </div>
      )}
    </div>
  )

  //////////////////////////////////////////////
  // Render
  //////////////////////////////////////////////
  return (
    <div className="px-2 sm:px-4 md:px-0">
      {/* Header with action buttons - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 mt-4 gap-4 sm:gap-0">
        <h2 className="text-[#8685C1] font-semibold text-xl sm:text-2xl font-nunito">
          Received Invoices
        </h2>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Action buttons - Responsive sizing */}
          <button
            onClick={onDownloadAll}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={downloadIcon} alt="Download" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onDeleteSelected}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={deleteIcon} alt="Delete" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onSearch}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={searchIcon} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={() => setShowFilters((prev) => !prev)}>
            <img
              src={filterIcon}
              alt="Filter"
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full p-1 sm:p-2"
            />
          </button>
        </div>
      </div>

      {/* Filters Panel - Responsive Grid */}
      {showFilters && (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDateFilter}
              onChange={(e) => setIssueDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Sender
            </label>
            <input
              type="text"
              placeholder="e.g. Vendor ABC"
              value={senderFilter}
              onChange={(e) => setSenderFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">-- Any --</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Min Amount
            </label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Max Amount
            </label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      )}

      {/* Mobile View - Card Layout */}
      {isMobile ? (
        <div>
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <MobileInvoiceCard key={invoice.id} invoice={invoice} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No invoices found
            </div>
          )}
        </div>
      ) : (
        /* Desktop/Tablet View - Table Layout */
        <div className="rounded-t-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 sm:p-4 text-center font-nunito text-black w-12 sm:w-14">&nbsp;</th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-24 sm:w-32">
                    Issue Date
                  </th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-24 sm:w-32">
                    Due Date
                  </th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-24 sm:w-32">
                    Invoice #
                  </th>
                  <th className="p-2 sm:p-4 pl-2 text-left font-nunito text-black text-xs sm:text-sm w-32 sm:w-48">
                    Items Description
                  </th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-32 sm:w-48">
                    Sender
                  </th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-24 sm:w-32">
                    Status
                  </th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-24 sm:w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => {
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
                          <td className="p-2 sm:p-4 text-center">
                            <div className="inline-block w-4 h-4 sm:w-5 sm:h-5 border border-[#7C77C1] rounded flex items-center justify-center relative">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onSelect(id)}
                                className="opacity-0 absolute cursor-pointer w-full h-full"
                              />
                              {isSelected && (
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="sm:w-[14px] sm:h-[14px]">
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
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{invoiceData.invoiceDate || 'N/A'}</td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{invoiceData.dueDate || 'N/A'}</td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{invoiceData.invoiceNumber || 'N/A'}</td>
                          <td className="p-2 sm:p-4 pl-2 text-xs sm:text-sm">
                            <div className="max-w-[120px] sm:max-w-[200px] truncate" title={
                              invoiceData.items
                                .map((item) => item.description)
                                .join(', ') || 'N/A'
                            }>
                              {invoiceData.items
                                .map((item) => item.description)
                                .join(', ') || 'N/A'}
                            </div>
                          </td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">
                            <div className="max-w-[100px] sm:max-w-[150px] truncate" title={invoiceData.companyName || 'N/A'}>
                              {invoiceData.companyName || 'N/A'}
                            </div>
                          </td>
                          {/* Status is read-only for buyer */}
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">
                            <span
                              className="inline-block px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium"
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
                          <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">
                            {invoiceData.totals?.total != null
                              ? `CAD ${invoiceData.totals.total.toFixed(2)}`
                              : 'N/A'}
                          </td>
                        </tr>

                        {/* Expanded Row for preview */}
                        {expandedInvoiceId === id && (
                          <tr>
                            <td colSpan={8} className="bg-gray-50">
                              <div className="p-3 sm:p-4">
                                {/* Here, we use InvoicePreview with hideEditButton={true} */}
                                <InvoicePreview
                                  // Mapping buyer invoice data to the InvoicePreview fields
                                  invoiceData={{
                                    invoiceNumber: invoiceData.invoiceNumber,
                                    invoiceDate: invoiceData.invoiceDate,
                                    dueDate: invoiceData.dueDate,
                                    companyName: invoiceData.companyName, // Use the company name from the invoice
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
                                    price: bItem.price, // Map rate to price for InvoicePreview
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
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile-specific quick actions */}
      {isMobile && selectedInvoices.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedInvoices.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={onDownloadAll}
                className="px-3 py-2 bg-[#8B85C1] text-white text-sm rounded-md hover:bg-[#7A6FB0] transition-colors"
              >
                Download
              </button>
              <button
                onClick={onDeleteSelected}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  // Clear selection logic would go here
                  filteredInvoices.forEach(invoice => {
                    if (selectedInvoices.includes(invoice.id)) {
                      onSelect(invoice.id);
                    }
                  });
                }}
                className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerInvoiceTable;