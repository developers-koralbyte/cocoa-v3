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
              const invoiceData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as VendorInvoice),
              }))
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B85C1]" />
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-bold font-nunito">
            Invoices
          </h1>
          <Header
            userName={currentUser?.username || 'User'}
            userRole={currentUser?.role || 'Vendor'}
            userImage={currentUser?.avatar || '/default-avatar.jpg'}
          />
        </div>

        {/* Create New Invoice button */}
        <div className="ml-5 flex items-start mt-4 mb-5">
          <img
            src={CreateNewInvoice}
            alt="Create New Invoice"
            className="hover:opacity-90 cursor-pointer"
            onClick={() => navigate('/create-new-invoice')}
          />
          <div className="ml-5 mt-5 text-[20px] text-buttonBg font-nunito">
            <button onClick={() => navigate('/create-new-invoice')}>
              Create New Invoice
            </button>
          </div>
        </div>

        {/* Our new 2-stat display */}
        <StatsSection
          balanceOutstanding={balanceOutstanding.toFixed(2)}
          issuedBalance={issuedBalance.toFixed(2)}
        />

        {downloadStatus && (
          <div
            className={`p-3 mb-4 rounded ${
              downloadStatus.includes('Error')
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {downloadStatus}
          </div>
        )}

        {showSearch && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded w-full"
            />
          </div>
        )}

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
    </BaseLayout>
  )
}

export default VendorInvoicesPage
