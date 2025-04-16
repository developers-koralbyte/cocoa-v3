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

  return (
    <div>
      {/* Header with action buttons */}
      <div className="flex items-center mb-6 mt-4">
        <h2 className="text-[#8685C1] font-semibold text-2xl font-nunito pr-10">
          Invoices History
        </h2>
        <div className="flex items-center gap-3">
          {/* Download button */}
          <button
            onClick={onDownloadAll}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={downloadIcon} alt="Download" className="w-5 h-5" />
          </button>
          {/* Delete button */}
          <button
            onClick={onDeleteSelected}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
          </button>
          {/* Optional search button (no search bar in this file) */}
          <button
            onClick={onSearch}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={searchIcon} alt="Search" className="w-5 h-5" />
          </button>
          {/* Toggle advanced filters */}
          <button onClick={() => setShowFilters((prev) => !prev)}>
            <img
              src={filterIcon}
              alt="Filter"
              className="mt-2 w-[40.99px] h-[40.99px] bg-white rounded-full flex items-center justify-center"
            />
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Issue Date */}
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
          {/* Due Date */}
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
          {/* Recipient filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient
            </label>
            <input
              type="text"
              placeholder="e.g. John"
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {/* Status filter */}
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
              <option value="Draft">Draft</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          {/* Min Amount */}
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
          {/* Max Amount */}
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
          {/* Draft Only checkbox */}
          <div className="flex items-center">
            <label className="inline-flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={draftOnly}
                onChange={() => setDraftOnly((prev) => !prev)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Draft Only</span>
            </label>
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
                <th className="p-4 text-left font-nunito text-black w-32">Issue Date</th>
                <th className="p-4 text-left font-nunito text-black w-32">Due Date</th>
                <th className="p-4 text-left font-nunito text-black w-32">Invoice #</th>
                <th className="p-4 pl-2 text-left font-nunito text-black w-[200px]">
                  Items Description
                </th>
                <th className="p-4 pl-6 text-left font-nunito text-black w-48">Recipient</th>
                <th className="p-4 text-left font-nunito text-black w-32">Status</th>
                <th className="p-4 text-left font-nunito text-black w-32">Amount</th>
                <th className="p-4 text-left font-nunito text-black w-24">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
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
                    <td className="p-4 text-center">
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
                    </td>
                    <td className="p-4 text-sm">{invoice.invoiceData.invoiceDate || 'N/A'}</td>
                    <td className="p-4 text-sm">{invoice.invoiceData.dueDate || 'N/A'}</td>
                    <td className="p-4 text-sm">
                      {invoice.invoiceData.invoiceNumber || 'N/A'}
                    </td>
                    <td className="p-4 pl-2 text-sm">
                      {invoice.invoiceData.items
                        .map((item) => item.description)
                        .join(', ') || 'N/A'}
                    </td>
                    <td className="p-4 text-sm">
                      {invoice.invoiceData.recipientName || 'N/A'}
                    </td>
                    <td className="p-4">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusSelect(invoice.id, e.target.value)}
                        className="appearance-none cursor-pointer pr-8 pl-4 py-1 rounded-full text-sm font-medium"
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
                    <td className="p-4 font-medium text-sm">
                      {invoice.invoiceData.totals?.total != null
                        ? `CAD ${invoice.invoiceData.totals.total.toFixed(2)}`
                        : 'N/A'}
                    </td>
                    <td className="p-4">
                      {invoice.status === 'Draft' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/edit-invoice/${invoice.id}`)
                          }}
                          className="bg-buttonBg text-white text-sm px-3 py-1 rounded-[1.5rem]"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>

                  {expandedInvoiceId === invoice.id && (
                    <tr>
                      <td colSpan={9} className="bg-gray-50">
                        <div className="p-4">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default VendorInvoiceTable
