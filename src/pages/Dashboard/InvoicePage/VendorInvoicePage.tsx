import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { auth, db } from '../../../utils/firebase'
import { useUserStore } from '../../../utils/userStore'
import BaseLayout from '../../../components/Dashboard/BaseLayout'
import VendorInvoiceTable from '../../../components/Dashboard/Invoices/VendorInvoiceTable'
import StatsSection from '../../../components/Dashboard/Invoices/StatsSection'
import Header from '../../../components/Dashboard/Invoices/HeaderProps'
import CreateNewInvoice from '../../../assets/icons/VendorNewInvoice.svg'
import { downloadMultipleInvoices } from '../../../utils/InvoiceDownloadService'

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
  status: string
  invoiceData: {
    invoiceNumber: string
    invoiceDate: string
    dueDate: string
    recipientName: string
    items: InvoiceItem[]
    totals: {
      subtotal: number
      tax: number
      total: number
    }
  }
}

const VendorInvoicesPage = () => {
  const navigate = useNavigate()
  const { currentUser, fetchUserInfo } = useUserStore()
  const [isLoading, setIsLoading] = useState(true)
  const [invoices, setInvoices] = useState<VendorInvoice[]>([])
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)
  const [isTablet, setIsTablet] = useState(
    window.innerWidth > 640 && window.innerWidth <= 1024
  )

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width <= 640)
      setIsTablet(width > 640 && width <= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await fetchUserInfo(user.uid)
          const q = query(
            collection(db, 'vendorInvoices'),
            where('vendorId', '==', user.uid)
          )

          onSnapshot(
            q,
            (snapshot) => {
              const invoiceData = snapshot.docs.map((doc) => {
                const data = doc.data() as Omit<VendorInvoice, 'id'>
                return {
                  ...data,
                  id: doc.id,
                }
              })
              setInvoices(invoiceData)
            },
            (error) => {
              console.error('Error listening to vendor invoices:', error)
            }
          )
        } catch (error) {
          console.error('Error fetching user info:', error)
          navigate('/login')
        }
      } else {
        navigate('/login')
      }
      setIsLoading(false)
    })

    return () => unsubscribeAuth()
  }, [fetchUserInfo, navigate])

  // ------------------
  // Deleting invoices
  // ------------------
  const handleDeleteSelected = async () => {
    if (selectedInvoices.length === 0) {
      alert('No invoices selected for deletion')
      return
    }
    if (!window.confirm(`Delete ${selectedInvoices.length} invoices?`)) return

    try {
      for (const invoiceId of selectedInvoices) {
        await deleteDoc(doc(db, 'vendorInvoices', invoiceId))
      }
      setInvoices((prev) =>
        prev.filter((invoice) => !selectedInvoices.includes(invoice.id))
      )
      setSelectedInvoices([])
      alert('Invoice(s) deleted successfully')
    } catch (error) {
      console.error('Error deleting invoices:', error)
      alert('Error deleting invoice(s)')
    }
  }

  // ------------------
  // Downloading invoices
  // ------------------
  const handleDownloadAll = async () => {
    if (selectedInvoices.length === 0) {
      alert('No invoices selected for download')
      return
    }
    setDownloadStatus('Preparing downloads...')

    try {
      const selectedInvoiceObjects = invoices.filter((invoice) =>
        selectedInvoices.includes(invoice.id)
      )
      if (!selectedInvoiceObjects.length) {
        setDownloadStatus('Error: Could not find selected invoices')
        return
      }

      const success = await downloadMultipleInvoices(
        selectedInvoiceObjects,
        'vendor-invoice'
      )
      setDownloadStatus(
        success
          ? 'Invoices downloaded successfully'
          : 'Some invoices failed to download'
      )
    } catch (error: any) {
      console.error('Error downloading invoices:', error)
      setDownloadStatus(`Error: ${error.message || 'Unexpected error'}`)
    } finally {
      setTimeout(() => setDownloadStatus(null), 3000)
    }
  }

  // ------------------
  // Searching
  // ------------------
  const handleToggleSearch = () => {
    setShowSearch(!showSearch)
    if (!showSearch) setSearchTerm('')
  }

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const filteredInvoices = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase()
    return invoices.filter(({ invoiceData }) =>
      invoiceData.invoiceNumber.toLowerCase().includes(lowerTerm) ||
      invoiceData.recipientName.toLowerCase().includes(lowerTerm)
    )
  }, [invoices, searchTerm])

  // ------------------
  // Stats Calculation
  // ------------------
  // "Balance Outstanding" = sum of all unpaid invoice totals
  const balanceOutstanding = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'Unpaid' || inv.status === 'Sent, Unpaid')
      .reduce((sum, inv) => sum + inv.invoiceData.totals.total, 0)
  }, [invoices])

  // "Issued Balance" = sum of all invoices (paid or unpaid)
  const issuedBalance = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.invoiceData.totals.total, 0)
  }, [invoices])

  // Optional: We still transform our data for the table
  const tableInvoices = filteredInvoices.map((invoice) => ({
    ...invoice,
    invoiceData: {
      ...invoice.invoiceData,
      items: invoice.invoiceData.items.map((item) => ({
        ...item,
        rate: item.price,
      })),
    },
  }))

  // For dropdown updates
  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'vendorInvoices', invoiceId), {
        status: newStatus,
      })
      console.log(`Invoice ${invoiceId} updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating invoice status:', error)
      alert('Failed to update invoice status')
    }
  }

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#8B85C1]" />
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <div className="p-3 sm:p-4 md:p-6 max-w-full overflow-hidden">
        {/* Header Section - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-nunito">
            Invoices
          </h1>
          <div className="flex-shrink-0">
            <Header
              userName={currentUser?.username || 'User'}
              userRole={currentUser?.role || 'Vendor'}
              userImage={currentUser?.avatar || '/default-avatar.jpg'}
            />
          </div>
        </div>

        {/* Create New Invoice Section - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-5">
          <div className="flex-shrink-0">
            <img
              src={CreateNewInvoice}
              alt="Create New Invoice"
              className="hover:opacity-90 cursor-pointer w-12 h-12 sm:w-16 sm:h-16 md:w-auto md:h-auto"
              onClick={() => navigate('/create-new-invoice')}
            />
          </div>
          <div className="flex-1">
            <button 
              onClick={() => navigate('/create-new-invoice')}
              className="text-base sm:text-lg md:text-xl text-buttonBg font-nunito hover:text-[#6B5B95] transition-colors"
            >
              Create New Invoice
            </button>
          </div>
        </div>

        {/* Stats Section - Responsive */}
        <div className="mb-4 sm:mb-6">
          <StatsSection
            balanceOutstanding={balanceOutstanding.toFixed(2)}
            issuedBalance={issuedBalance.toFixed(2)}
          />
        </div>

        {/* Download Status - Responsive */}
        {downloadStatus && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm sm:text-base ${
              downloadStatus.includes('Error')
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {downloadStatus.includes('Error') ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              <span className="break-words">{downloadStatus}</span>
            </div>
          </div>
        )}

        {/* Search Section - Responsive */}
        {showSearch && (
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search invoices by number or recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 sm:p-4 pr-10 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8B85C1] focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {searchTerm && (
              <div className="mt-2 text-xs sm:text-sm text-gray-600">
                {filteredInvoices.length} of {invoices.length} invoices match your search
              </div>
            )}
          </div>
        )}

        {/* Main Invoice Table - Responsive Container */}
        <div className="overflow-hidden">
          <VendorInvoiceTable
            invoices={tableInvoices}
            selectedInvoices={selectedInvoices}
            onSelect={handleInvoiceSelect}
            onDownloadAll={handleDownloadAll}
            onDeleteSelected={handleDeleteSelected}
            onSearch={handleToggleSearch}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Mobile-specific quick actions */}
        {isMobile && selectedInvoices.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {selectedInvoices.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadAll}
                  className="px-3 py-2 bg-[#8B85C1] text-white text-sm rounded-md hover:bg-[#7A6FB0] transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedInvoices([])}
                  className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State - Responsive */}
        {invoices.length === 0 && !isLoading && (
          <div className="text-center py-12 sm:py-16">
            <div className="max-w-md mx-auto px-4">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                No invoices yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Create your first invoice to get started with managing your business finances.
              </p>
              <button
                onClick={() => navigate('/create-new-invoice')}
                className="inline-flex items-center px-4 py-2 bg-[#8B85C1] text-white text-sm sm:text-base font-medium rounded-lg hover:bg-[#7A6FB0] transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  )
}

export default VendorInvoicesPage