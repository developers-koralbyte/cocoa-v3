import React from 'react'
import searchIcon from '../../../assets/icons/search.svg'
import downloadIcon from '../../../assets/icons/download.svg'
import deleteIcon from '../../../assets/icons/trash.svg'

interface BuyerInvoice {
  id: string
  vendorId: string
  buyerId: string
  status: 'Paid' | 'Unpaid' | 'Cancelled'
  invoiceData: {
    invoiceNumber: string
    invoiceDate: string // e.g. "2025-04-10"
    dueDate: string
    companyName: string
    items: Array<{
      id: number
      description: string
      quantity: number
      rate: number
      tax: number
    }>
    totals: {
      subtotal: number
      tax: number
      total: number
    }
  }
}

interface InvoiceTableProps {
  invoices: BuyerInvoice[]
  selectedInvoices: string[]
  onSelect: (id: string) => void
  onDownloadAll?: () => void
  onDeleteSelected?: () => void
  onSearch?: () => void
}

interface InvoiceRowProps {
  invoice: BuyerInvoice
  isSelected: boolean
  onSelect: (id: string) => void
}

// Function to get the status background color
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Paid':
      return { backgroundColor: '#87C66A9E' } // Green with 62% opacity
    case 'Unpaid':
      return { backgroundColor: '#8FDCE64F' } // Light green with 31% opacity
    case 'Cancelled':
      return { backgroundColor: '#FD51517A' } // Red with 48% opacity
    default:
      return { backgroundColor: '#f3f4f6' } // Default gray
  }
}

// Separate component for each invoice row
const BuyerInvoiceRow: React.FC<InvoiceRowProps> = ({
  invoice,
  isSelected,
  onSelect,
}) => {
  const { id, status, invoiceData } = invoice

  const invoiceDate = invoiceData?.invoiceDate || 'N/A'
  const dueDate = invoiceData?.dueDate || 'N/A'
  const invoiceNumber = invoiceData?.invoiceNumber || 'N/A'

  // Collect all item descriptions, comma-separated
  const allDescriptions =
    invoiceData?.items?.length > 0
      ? invoiceData.items.map((item) => item.description).join(', ')
      : 'N/A'

  // "Sender" is derived from companyName in this example
  const sender = invoiceData?.companyName || 'N/A'

  // read-only status styling
  const statusStyle = getStatusStyle(status)
  const amount =
    invoiceData?.totals?.total != null
      ? `CAD ${invoiceData.totals.total.toFixed(2)}`
      : 'N/A'

  return (
    <tr className="border-b border-[#E5E7EB] hover:bg-gray-50">
      {/* Checkbox cell */}
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

      {/* Issue Date */}
      <td className="p-4 text-sm">{invoiceDate}</td>

      {/* Due Date */}
      <td className="p-4 text-sm">{dueDate}</td>

      {/* Invoice # */}
      <td className="p-4 text-sm">{invoiceNumber}</td>

      {/* All items, comma-separated */}
      <td className="p-4 pl-2 text-sm">{allDescriptions}</td>

      {/* Sender */}
      <td className="p-4 pl-6 text-sm">{sender}</td>

      {/* Status */}
      <td className="p-4">
        <span
          className="inline-block px-4 py-1 rounded-full text-sm font-medium"
          style={{
            ...statusStyle,
            color: 'black',
          }}
        >
          {status}
        </span>
      </td>

      {/* Amount */}
      <td className="p-4 font-medium text-sm">{amount}</td>
    </tr>
  )
}

const BuyerInvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  selectedInvoices,
  onSelect,
  onDownloadAll = () => {
    console.log('Download functionality not implemented yet')
  },
  onDeleteSelected = () => {
    console.log('Delete functionality not implemented yet')
  },
  onSearch = () => {
    console.log('Search functionality not implemented yet')
  },
}) => {
  // Add search state
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isSearchVisible, setIsSearchVisible] = React.useState(false)

  // Add filter panel state
  const [showFilters, setShowFilters] = React.useState(false)

  // Example filter states
  const [issueDateFilter, setIssueDateFilter] = React.useState('')
  const [dueDateFilter, setDueDateFilter] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [amountMin, setAmountMin] = React.useState('')
  const [amountMax, setAmountMax] = React.useState('')

  // Filter + sort by newest invoiceDate
  const filteredAndSortedInvoices = React.useMemo(() => {
    // 1) Filter by searchTerm
    let results = invoices

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      results = results.filter((invoice) => {
        const { invoiceData, status } = invoice
        // Search in multiple fields
        const matchesSearch =
          status.toLowerCase().includes(searchLower) ||
          invoiceData.invoiceNumber?.toLowerCase().includes(searchLower) ||
          invoiceData.companyName?.toLowerCase().includes(searchLower) ||
          invoiceData.items?.some((item) =>
            item.description.toLowerCase().includes(searchLower)
          )
        return matchesSearch
      })
    }

    // 2) Additional filter logic
    results = results.filter((inv) => {
      const { invoiceData } = inv

      // If the user selected an exact issueDate
      if (issueDateFilter && invoiceData.invoiceDate !== issueDateFilter) {
        return false
      }
      // If the user selected an exact dueDate
      if (dueDateFilter && invoiceData.dueDate !== dueDateFilter) {
        return false
      }
      // Status
      if (statusFilter && inv.status !== statusFilter) {
        return false
      }
      // Amount range
      const total = invoiceData.totals.total
      if (amountMin && total < parseFloat(amountMin)) {
        return false
      }
      if (amountMax && total > parseFloat(amountMax)) {
        return false
      }

      return true
    })

    // 3) Sort descending by invoiceDate
    results = [...results].sort((a, b) => {
      const dateA = new Date(a.invoiceData.invoiceDate).getTime()
      const dateB = new Date(b.invoiceData.invoiceDate).getTime()
      return dateB - dateA // newest first
    })

    return results
  }, [invoices, searchTerm, issueDateFilter, dueDateFilter, statusFilter, amountMin, amountMax])

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
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(124,119,193,0.3)] hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)] transition-shadow"
          >
            <img
              src={searchIcon}
              alt="Search"
              className="w-[17.99px] h-[17.99px]"
            />
          </button>

          {/* Toggle filter panel */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="px-3 py-1 bg-white rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:shadow-md transition-shadow"
          >
            Filters
          </button>
        </div>
      </div>

      {/* Search input (conditionally rendered) */}
      {isSearchVisible && (
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoices..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C77C1]"
          />
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="border border-gray-200 rounded p-4 mb-4 flex flex-col md:flex-row gap-2 md:gap-4 bg-gray-50">
          {/* Issue Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Issue Date</label>
            <input
              type="date"
              value={issueDateFilter}
              onChange={(e) => setIssueDateFilter(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>

          {/* Due Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>

          {/* Status filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">-- Any --</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Amount range */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Min Amount</label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Max Amount</label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-t-[1.5rem] overflow-hidden shadow-[0_2px_10px_rgba(124,119,193,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#E8E6F2]">
                {/* Checkbox column */}
                <th className="p-4 text-center font-nunito text-black w-14">
                  &nbsp;
                </th>
                {/* Issue Date */}
                <th className="p-4 text-left font-nunito text-black w-32">
                  Issue Date
                </th>
                {/* Due Date */}
                <th className="p-4 text-left font-nunito text-black w-32">
                  Due Date
                </th>
                {/* Invoice # */}
                <th className="p-4 text-left font-nunito text-black w-32">
                  Invoice #
                </th>
                {/* Items Description */}
                <th className="p-4 pl-2 text-left font-nunito text-black w-[200px]">
                  Items Description
                </th>
                {/* Sender */}
                <th className="p-4 pl-6 text-left font-nunito text-black w-48">
                  Sender
                </th>
                {/* Status (read-only for buyers) */}
                <th className="p-4 text-left font-nunito text-black w-32">
                  Status
                </th>
                {/* Amount */}
                <th className="p-4 text-left font-nunito text-black w-32">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedInvoices.map((invoice) => (
                <BuyerInvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  isSelected={selectedInvoices.includes(invoice.id)}
                  onSelect={onSelect}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BuyerInvoiceTable
