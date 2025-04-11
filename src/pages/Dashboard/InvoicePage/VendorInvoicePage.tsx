
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { auth, db } from '../../../utils/firebase'
import { useUserStore } from '../../../utils/userStore'
import BaseLayout from '../../../components/Dashboard/BaseLayout'
import VendorInvoiceTable from '../../../components/Dashboard/Invoices/VendorInvoiceTable'
import StatsSection from '../../../components/Dashboard/Invoices/StatsSection'
import Header from '../../../components/Dashboard/Invoices/HeaderProps'
import CreateNewInvoice from '../../../assets/icons/VendorNewInvoice.svg'
import {
  downloadInvoice,
  downloadMultipleInvoices,
} from '../../../utils/InvoiceDownloadService'

interface InvoiceItem {
  id: number
  description: string
  quantity: number
  price: number
  tax: number
  rate?: number
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

  // Listen to vendor invoices in real time
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await fetchUserInfo(user.uid)
          const q = query(
            collection(db, 'vendorInvoices'),
            where('vendorId', '==', user.uid)
          )
          const unsubscribeInvoices = onSnapshot(
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

  const handleDeleteSelected = async () => {
    if (selectedInvoices.length === 0) {
      alert('No invoices selected for deletion')
      return
    }
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedInvoices.length} invoice(s)?`)
    if (!confirmDelete) return
    try {
      for (const invoiceId of selectedInvoices) {
        await deleteDoc(doc(db, 'vendorInvoices', invoiceId))
      }
      setInvoices((prev) => prev.filter(invoice => !selectedInvoices.includes(invoice.id)))
      setSelectedInvoices([])
      alert('Invoice(s) deleted successfully')
    } catch (error) {
      console.error('Error deleting invoices:', error)
      alert('Error deleting invoice(s)')
    }
  }

  const handleDownloadAll = async () => {
    if (selectedInvoices.length === 0) {
      alert('No invoices selected for download')
      return
    }
    setDownloadStatus('Preparing downloads...')
    try {
      const selectedInvoiceObjects = invoices.filter(invoice =>
        selectedInvoices.includes(invoice.id)
      )
      if (!selectedInvoiceObjects.length) {
        setDownloadStatus('Error: Could not find selected invoices')
        return
      }
      const success = await downloadMultipleInvoices(selectedInvoiceObjects, 'vendor-invoice')
      setDownloadStatus(success ? 'Invoices downloaded successfully' : 'Some invoices failed to download')
    } catch (error: any) {
      console.error('Error downloading invoices:', error)
      setDownloadStatus(`Error: ${error.message || 'Unexpected error'}`)
    } finally {
      setTimeout(() => setDownloadStatus(null), 3000)
    }
  }

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

  const today = new Date().toISOString().split('T')[0]

  const totalSalesToday = useMemo(() => {
    return invoices
      .filter(inv => inv.invoiceData.invoiceDate === today)
      .reduce((sum, inv) => sum + inv.invoiceData.totals.total, 0)
  }, [invoices, today])

  const todayRevenue = useMemo(() => {
    return invoices
      .filter(inv => inv.invoiceData.invoiceDate === today && inv.status === 'Sent, Paid')
      .reduce((sum, inv) => sum + inv.invoiceData.totals.total, 0)
  }, [invoices, today])

  const inEscrow = useMemo(() => {
    return invoices
      .filter(inv => inv.status === 'Sent, Unpaid')
      .reduce((sum, inv) => sum + inv.invoiceData.totals.total, 0)
  }, [invoices])

  const tableInvoices = filteredInvoices.map(invoice => ({
    ...invoice,
    invoiceData: {
      ...invoice.invoiceData,
      items: invoice.invoiceData.items.map(item => ({
        ...item,
        rate: item.price, // or any other calculation
      })),
    },
  }))

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

        <div className="ml-5 flex items-start mt-4 mb-5">
          <img
            src={CreateNewInvoice}
            alt="Create New Invoice"
            className="hover:opacity-90 cursor-pointer"
            onClick={() => navigate('/create-new-invoice')}
          />
          <div className="ml-5 mt-5 text-[20px] text-buttonBg font-nunito">
            <button onClick={() => navigate('/create-new-invoice')}>Create New Invoice</button>
          </div>
        </div>

        <StatsSection
          totalSales={totalSalesToday.toFixed(2)}
          todayRevenue={todayRevenue.toFixed(2)}
          inEscrow={inEscrow.toFixed(2)}
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
        />
      </div>
    </BaseLayout>
  )
}

export default VendorInvoicesPage
