import React from 'react'
import { useNavigate } from 'react-router-dom' // 1) Import useNavigate
import searchIcon from '../../../assets/icons/search.svg'
import downloadIcon from '../../../assets/icons/download.svg'
import deleteIcon from '../../../assets/icons/trash.svg'
import InvoicePreview from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoicePreview'

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
  status: string // e.g. 'Draft', 'Sent, Unpaid', 'Paid', 'Cancelled'
  invoiceData: {
    invoiceNumber: string
    invoiceDate: string // in "YYYY-MM-DD" format
    dueDate: string // in "YYYY-MM-DD" format
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
}

interface InvoiceRowProps {
  invoice: VendorInvoice
  isSelected: boolean
  onSelect: (id: string) => void
  onClickRow?: (id: string) => void // for toggling preview
}

const InvoiceRow: React.FC<InvoiceRowProps> = ({
  invoice,
  isSelected,
  onSelect,
  onClickRow,
}) => {
  const { id, status: initialStatus, invoiceData } = invoice
  const [currentStatus, setCurrentStatus] = React.useState(initialStatus || 'Unpaid')

  const invoiceDate = invoiceData?.invoiceDate || 'N/A'
  const dueDate = invoiceData?.dueDate || 'N/A'
  const invoiceNumber = invoiceData?.invoiceNumber || 'N/A'
  const allDescriptions =
    invoiceData?.items
      ?.map((item: InvoiceItem) => item.description)
      .join(', ') || 'N/A'
  const recipient = invoiceData?.recipientName || 'N/A'
  const amount =
    invoiceData?.totals?.total != null
      ? `CAD ${invoiceData.totals.total.toFixed(2)}`
      : 'N/A'

  return (
    <tr
      className="border-b border-[#E5E7EB] hover:bg-gray-50 cursor-pointer"
      onClick={(e) => {
        // If user clicks directly on checkbox input, skip toggling the preview
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
          return
        }
        // If there's a row-click callback, call it
        if (onClickRow) {
          onClickRow(id)
        }
      }}
    >
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

      {/* Recipient */}
      <td className="p-4 text-sm">{recipient}</td>

      {/* Status with dropdown */}
      <td className="p-4">
        <div className="relative inline-block">
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            className="appearance-none cursor-pointer pr-8 pl-4 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor:
                currentStatus === 'Paid' || currentStatus === 'Sent, Paid'
                  ? '#87C66A9E'
                  : currentStatus === 'Unpaid' || currentStatus === 'Sent, Unpaid'
                  ? '#8FDCE64F'
                  : currentStatus === 'Cancelled'
                  ? '#FD51517A'
                  : currentStatus === 'Draft'
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg
              className="h-4 w-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </td>

      {/* Amount */}
      <td className="p-4 font-medium text-sm">{amount}</td>
    </tr>
  )
}

const VendorInvoiceTable: React.FC<InvoiceTableProps> = ({
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
  // 1) Add navigate for Edit button
  const navigate = useNavigate()

  // Show/hide the filter panel
  const [showFilters, setShowFilters] = React.useState(false)

  // Filter fields
  const [issueDateFilter, setIssueDateFilter] = React.useState('')
  const [dueDateFilter, setDueDateFilter] = React.useState('')
  const [recipientFilter, setRecipientFilter] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [draftOnly, setDraftOnly] = React.useState(false)
  const [amountMin, setAmountMin] = React.useState('')
  const [amountMax, setAmountMax] = React.useState('')

  // 2) Track which invoice is expanded
  const [expandedInvoiceId, setExpandedInvoiceId] = React.useState<string | null>(null)

  // 3) Filter + sort logic
  const filteredInvoices = React.useMemo(() => {
    let results = invoices.filter((inv) => {
      const { invoiceData } = inv

      if (issueDateFilter && invoiceData.invoiceDate !== issueDateFilter) {
        return false
      }
      if (dueDateFilter && invoiceData.dueDate !== dueDateFilter) {
        return false
      }
      if (
        recipientFilter &&
        !invoiceData.recipientName.toLowerCase().includes(recipientFilter.toLowerCase())
      ) {
        return false
      }
      if (draftOnly && inv.status !== 'Draft') {
        return false
      }
      if (statusFilter && inv.status !== statusFilter) {
        return false
      }
      const invoiceTotal = invoiceData.totals.total
      if (amountMin && invoiceTotal < parseFloat(amountMin)) {
        return false
      }
      if (amountMax && invoiceTotal > parseFloat(amountMax)) {
        return false
      }
      return true
    })

    results = results.sort((a, b) => {
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
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center
                       shadow-[0_2px_10px_rgba(124,119,193,0.3)]
                       hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)]
                       transition-shadow"
          >
            <img
              src={downloadIcon}
              alt="Download"
              className="w-[17.99px] h-[17.99px]"
            />
          </button>

          <button
            onClick={onDeleteSelected}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center
                       shadow-[0_2px_10px_rgba(124,119,193,0.3)]
                       hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)]
                       transition-shadow"
          >
            <img
              src={deleteIcon}
              alt="Delete"
              className="w-[17.99px] h-[17.99px]"
            />
          </button>

          <button
            onClick={onSearch}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center
                       shadow-[0_2px_10px_rgba(124,119,193,0.3)]
                       hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)]
                       transition-shadow"
          >
            <img
              src={searchIcon}
              alt="Search"
              className="w-[17.99px] h-[17.99px]"
            />
          </button>

          {/* Toggle the filter panel */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="px-3 py-2 bg-white rounded-full border border-gray-300 
                       flex items-center shadow-xl justify-center text-buttonBg hover:shadow-md transition-shadow"
          >
            Filters
          </button>
        </div>
      </div>

      {/* Filter panel */}
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

          {/* Recipient */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Recipient</label>
            <input
              type="text"
              placeholder="e.g. John"
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">-- Any --</option>
              <option value="Draft">Draft</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Draft only */}
          <div className="flex flex-col justify-end">
            <label className="inline-flex items-center mt-5">
              <input
                type="checkbox"
                checked={draftOnly}
                onChange={() => setDraftOnly((prev) => !prev)}
                className="mr-2"
              />
              Draft Only
            </label>
          </div>

          {/* Min Amount */}
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

          {/* Max Amount */}
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
                <th className="p-4 text-center font-nunito text-black w-14">&nbsp;</th>
                {/* Issue Date */}
                <th className="p-4 text-left font-nunito text-black w-32">Issue Date</th>
                {/* Due Date */}
                <th className="p-4 text-left font-nunito text-black w-32">Due Date</th>
                {/* Invoice Number */}
                <th className="p-4 text-left font-nunito text-black w-32">Invoice #</th>
                {/* Item Descriptions */}
                <th className="p-4 pl-2 text-left font-nunito text-black w-[200px]">
                  Items Description
                </th>
                {/* Recipient */}
                <th className="p-4 text-left font-nunito text-black w-48">Recipient</th>
                {/* Status */}
                <th className="p-4 text-left font-nunito text-black w-32">Status</th>
                {/* Amount */}
                <th className="p-4 text-left font-nunito text-black w-32">Amount</th>

                {/* NEW: Edit column */}
                <th className="p-4 text-left font-nunito text-black w-24">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <React.Fragment key={invoice.id}>
                  {/* MAIN ROW */}
                  <tr
                    className="border-b border-[#E5E7EB] hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      // If user clicks directly on checkbox input, skip toggling the preview
                      if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                        return
                      }
                      // Expand or collapse preview
                      setExpandedInvoiceId((prev) => (prev === invoice.id ? null : invoice.id))
                    }}
                  >
                    {/* Checkbox cell */}
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

                    {/* Issue Date */}
                    <td className="p-4 text-sm">
                      {invoice.invoiceData.invoiceDate || 'N/A'}
                    </td>

                    {/* Due Date */}
                    <td className="p-4 text-sm">
                      {invoice.invoiceData.dueDate || 'N/A'}
                    </td>

                    {/* Invoice # */}
                    <td className="p-4 text-sm">
                      {invoice.invoiceData.invoiceNumber || 'N/A'}
                    </td>

                    {/* All items, comma-separated */}
                    <td className="p-4 pl-2 text-sm">
                      {invoice.invoiceData.items
                        .map((item) => item.description)
                        .join(', ') || 'N/A'}
                    </td>

                    {/* Recipient */}
                    <td className="p-4 text-sm">
                      {invoice.invoiceData.recipientName || 'N/A'}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <div className="relative inline-block">
                        <select
                          value={invoice.status}
                          onChange={(e) => {
                            /* handle status change or local row state if needed */
                          }}
                          className="appearance-none cursor-pointer pr-8 pl-4 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor:
                              invoice.status === 'Paid' || invoice.status === 'Sent, Paid'
                                ? '#87C66A9E'
                                : invoice.status === 'Unpaid' ||
                                  invoice.status === 'Sent, Unpaid'
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
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <svg
                            className="h-4 w-4 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-4 font-medium text-sm">
                      {invoice.invoiceData.totals?.total != null
                        ? `CAD ${invoice.invoiceData.totals.total.toFixed(2)}`
                        : 'N/A'}
                    </td>

                    {/* Edit Button (NEW) */}
                    <td className="p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation() // so it won't toggle the preview
                          navigate(`/edit-invoice/${invoice.id}`)
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED PREVIEW ROW */}
                  {expandedInvoiceId === invoice.id && (
                    <tr>
                      <td colSpan={9} style={{ backgroundColor: '#F9F9FF' }}>
                        <div className="p-4">
                          <InvoicePreview
                            invoiceData={invoice.invoiceData}
                            items={invoice.invoiceData.items}
                            totals={invoice.invoiceData.totals}
                            isPreview={true}
                            onTogglePreview={() => setExpandedInvoiceId(null)}
                            // companyLogo if you have it
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
