import React from 'react'
import { useNavigate } from 'react-router-dom'
import searchIcon from '../../../assets/icons/search.svg'
import downloadIcon from '../../../assets/icons/download.svg'
import deleteIcon from '../../../assets/icons/trash.svg'
import InvoicePreview from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoicePreview'
import filterIcon from '../../../assets/icons/filterIcon.svg'

interface InvoiceItem {
  id: number
  description: string
  quantity: number
  price: number
  tax: number
}

interface VendorInvoice {
  id: string
  vendorId: string
  buyerId: string
  status: string // e.g. 'Draft', 'Unpaid', 'Paid', 'Cancelled'
  invoiceData: {
    invoiceNumber: string
    invoiceDate: string
    dueDate: string
    companyName: string
    companyEmail: string
    companyAddress: string
    companyLocation: string
    recipientName: string
    recipientPhone: string
    recipientAddress: string
    recipientLocation: string
    iban: string
    bic: string
    recipientEmail: string
    bankName: string
    bankAddress: string
    accountName: string
    items: InvoiceItem[]
    totals: {
      subtotal: number
      tax: number
      total: number
    }
  }
}

interface InvoiceTableProps {
  invoices: VendorInvoice[]
  selectedInvoices: string[]
  onSelect: (id: string) => void
  onDownloadAll?: () => void
  onDeleteSelected?: () => void
  onSearch?: () => void
  /**
   * Called when user changes status in the dropdown
   */
  onStatusChange?: (invoiceId: string, newStatus: string) => Promise<void>
}

const VendorInvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  selectedInvoices,
  onSelect,
  onDownloadAll = () => console.log('Download not implemented'),
  onDeleteSelected = () => console.log('Delete not implemented'),
  onSearch = () => console.log('Search not implemented'),
  onStatusChange,
}) => {
  const navigate = useNavigate()

  // Responsive state
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 640)
  const [isTablet, setIsTablet] = React.useState(
    window.innerWidth > 640 && window.innerWidth <= 1024
  )

  // Handle responsive breakpoints
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width <= 640)
      setIsTablet(width > 640 && width <= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Toggle advanced filters
  const [showFilters, setShowFilters] = React.useState(false)

  // Advanced filters
  const [issueDateFilter, setIssueDateFilter] = React.useState('')
  const [dueDateFilter, setDueDateFilter] = React.useState('')
  const [recipientFilter, setRecipientFilter] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [draftOnly, setDraftOnly] = React.useState(false)
  const [amountMin, setAmountMin] = React.useState('')
  const [amountMax, setAmountMax] = React.useState('')

  // Track which invoice is expanded (preview)
  const [expandedInvoiceId, setExpandedInvoiceId] = React.useState<string | null>(null)

  // 1) Filter the invoices by advanced criteria
  // 2) Sort descending by invoiceDate (so the newest are on top)
  const filteredInvoices = React.useMemo(() => {
    let results = [...invoices]

    // Apply advanced filters
    results = results.filter((inv) => {
      const data = inv.invoiceData

      // Issue Date exact match
      if (issueDateFilter && data.invoiceDate !== issueDateFilter) {
        return false
      }
      // Due Date exact match
      if (dueDateFilter && data.dueDate !== dueDateFilter) {
        return false
      }
      // Recipient substring
      if (
        recipientFilter &&
        !data.recipientName.toLowerCase().includes(recipientFilter.toLowerCase())
      ) {
        return false
      }
      // Draft-only
      if (draftOnly && inv.status !== 'Draft') {
        return false
      }
      // Status
      if (statusFilter && inv.status !== statusFilter) {
        return false
      }

      // Amount range
      const total = data.totals.total
      if (amountMin && total < parseFloat(amountMin)) {
        return false
      }
      if (amountMax && total > parseFloat(amountMax)) {
        return false
      }

      return true
    })

    // Sort descending by invoiceDate => newest on top
    results.sort((a, b) => {
      const dateA = new Date(a.invoiceData.invoiceDate).getTime()
      const dateB = new Date(b.invoiceData.invoiceDate).getTime()
      return dateB - dateA
    })

    return results
  }, [
    invoices,
    issueDateFilter,
    dueDateFilter,
    recipientFilter,
    statusFilter,
    draftOnly,
    amountMin,
    amountMax,
  ])

  // Called when the user picks a new status in the dropdown
  const handleStatusSelect = async (invoiceId: string, newStatus: string) => {
    if (!onStatusChange) return
    try {
      await onStatusChange(invoiceId, newStatus)
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Error updating invoice status')
    }
  }

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
      case 'Draft':
        return `${baseStyle} bg-gray-100 text-gray-800`
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`
    }
  }

  // Mobile card component
  const MobileInvoiceCard = ({ invoice }: { invoice: VendorInvoice }) => (
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
          <span className="text-gray-600">Recipient:</span>
          <span className="font-medium">{invoice.invoiceData.recipientName || 'N/A'}</span>
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
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => setExpandedInvoiceId(
            expandedInvoiceId === invoice.id ? null : invoice.id
          )}
          className="text-[#7C77C1] text-sm font-medium"
        >
          {expandedInvoiceId === invoice.id ? 'Hide Preview' : 'View Preview'}
        </button>
        
        {invoice.status === 'Draft' && (
          <button
            onClick={() => navigate(`/edit-invoice/${invoice.id}`)}
            className="bg-buttonBg text-white text-sm px-4 py-2 rounded-full"
          >
            Edit
          </button>
        )}
      </div>

      {/* Expanded preview */}
      {expandedInvoiceId === invoice.id && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <InvoicePreview
            invoiceData={invoice.invoiceData}
            items={invoice.invoiceData.items}
            totals={invoice.invoiceData.totals}
            isPreview={true}
            onTogglePreview={() => setExpandedInvoiceId(null)}
          />
        </div>
      )}
    </div>
  )

  return (
    <div className="px-2 sm:px-4 md:px-0">
      {/* Header with action buttons - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 mt-4 gap-4 sm:gap-0">
        <h2 className="text-[#8685C1] font-semibold text-xl sm:text-2xl font-nunito">
          Invoices History
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

      {/* Advanced Filters Panel - Responsive Grid */}
      {showFilters && (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* Issue Date */}
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
          {/* Due Date */}
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
          {/* Recipient filter */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Recipient
            </label>
            <input
              type="text"
              placeholder="e.g. John"
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {/* Status filter */}
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
              <option value="Draft">Draft</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          {/* Min Amount */}
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
          {/* Max Amount */}
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
          {/* Draft Only checkbox */}
          <div className="flex items-center">
            <label className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={draftOnly}
                onChange={() => setDraftOnly((prev) => !prev)}
                className="form-checkbox h-3 w-3 sm:h-4 sm:w-4 text-blue-600"
              />
              <span className="ml-2">Draft Only</span>
            </label>
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
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-24 sm:w-32">Issue Date</th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-24 sm:w-32">Due Date</th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-24 sm:w-32">Invoice #</th>
                  <th className="p-2 sm:p-4 pl-2 text-left font-nunito text-black text-xs sm:text-sm w-32 sm:w-48">
                    Items Description
                  </th>
                  <th className="p-2 sm:p-4 pl-2 sm:pl-6 text-left font-nunito text-black text-xs sm:text-sm w-32 sm:w-48">Recipient</th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-24 sm:w-32">Status</th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-24 sm:w-32">Amount</th>
                  <th className="p-2 sm:p-4 text-left font-nunito text-black text-xs sm:text-sm w-20 sm:w-24">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <React.Fragment key={invoice.id}>
                      <tr
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          // Expand/collapse preview if not clicking the checkbox
                          if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                            return
                          }
                          setExpandedInvoiceId((prev) => (prev === invoice.id ? null : invoice.id))
                        }}
                      >
                        <td className="p-2 sm:p-4 text-center">
                          <div className="inline-block w-4 h-4 sm:w-5 sm:h-5 border border-[#7C77C1] rounded flex items-center justify-center relative">
                            <input
                              type="checkbox"
                              checked={selectedInvoices.includes(invoice.id)}
                              onChange={() => onSelect(invoice.id)}
                              className="opacity-0 absolute cursor-pointer w-full h-full"
                            />
                            {selectedInvoices.includes(invoice.id) && (
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
                        <td className="p-2 sm:p-4 text-xs sm:text-sm">{invoice.invoiceData.invoiceDate || 'N/A'}</td>
                        <td className="p-2 sm:p-4 text-xs sm:text-sm">{invoice.invoiceData.dueDate || 'N/A'}</td>
                        <td className="p-2 sm:p-4 text-xs sm:text-sm">
                          {invoice.invoiceData.invoiceNumber || 'N/A'}
                        </td>
                        <td className="p-2 sm:p-4 pl-2 text-xs sm:text-sm">
                          <div className="max-w-[120px] sm:max-w-[200px] truncate" title={
                            invoice.invoiceData.items
                              .map((item) => item.description)
                              .join(', ') || 'N/A'
                          }>
                            {invoice.invoiceData.items
                              .map((item) => item.description)
                              .join(', ') || 'N/A'}
                          </div>
                        </td>
                        <td className="p-2 sm:p-4 text-xs sm:text-sm">
                          <div className="max-w-[100px] sm:max-w-[150px] truncate" title={invoice.invoiceData.recipientName || 'N/A'}>
                            {invoice.invoiceData.recipientName || 'N/A'}
                          </div>
                        </td>
                        <td className="p-2 sm:p-4">
                          <select
                            value={invoice.status}
                            onChange={(e) => handleStatusSelect(invoice.id, e.target.value)}
                            className="appearance-none cursor-pointer pr-6 sm:pr-8 pl-2 sm:pl-4 py-1 rounded-full text-xs sm:text-sm font-medium"
                            style={{
                              backgroundColor:
                                invoice.status === 'Paid'
                                  ? '#87C66A9E'
                                  : invoice.status === 'Unpaid'
                                  ? '#8FDCE64F'
                                  : invoice.status === 'Cancelled'
                                  ? '#FD51517A'
                                  : invoice.status === 'Draft'
                                  ? '#F3F4F6'
                                  : '#f3f4f6',
                              color: 'black',
                            }}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">
                          {invoice.invoiceData.totals?.total != null
                            ? `CAD ${invoice.invoiceData.totals.total.toFixed(2)}`
                            : 'N/A'}
                        </td>
                        <td className="p-2 sm:p-4">
                          {invoice.status === 'Draft' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/edit-invoice/${invoice.id}`)
                              }}
                              className="bg-buttonBg text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full sm:rounded-[1.5rem]"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>

                      {expandedInvoiceId === invoice.id && (
                        <tr>
                          <td colSpan={9} className="bg-gray-50">
                            <div className="p-3 sm:p-4">
                              <InvoicePreview
                                invoiceData={invoice.invoiceData}
                                items={invoice.invoiceData.items}
                                totals={invoice.invoiceData.totals}
                                isPreview={true}
                                onTogglePreview={() => setExpandedInvoiceId(null)}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorInvoiceTable