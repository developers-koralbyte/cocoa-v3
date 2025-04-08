import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, onSnapshot, doc, writeBatch } from 'firebase/firestore'
import { auth, db } from '../../../utils/firebase'
import { useUserStore } from '../../../utils/userStore'
import BaseLayout from '../../../components/Dashboard/BaseLayout'
import InvoiceTable from '../../../components/Dashboard/Invoices/BuyerInvoiceTable'
import Header from '../../../components/Dashboard/Invoices/HeaderProps'
import { downloadMultipleInvoices } from '../../../utils/InvoiceDownloadService'

interface BuyerInvoice {
  id: string
  vendorId: string
  buyerId: string
  status: 'Paid' | 'Unpaid' | 'Cancelled'
  hiddenForBuyer?: boolean
  invoiceData: {
    invoiceNumber: string
    invoiceDate: string
    dueDate: string
    senderName: string
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

const InvoicesPage = () => {
  const navigate = useNavigate()
  const { currentUser, fetchUserInfo } = useUserStore()
  const [isLoading, setIsLoading] = useState(true)
  const [invoices, setInvoices] = useState<BuyerInvoice[]>([])
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)

  // Listen in real time to buyer invoices
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await fetchUserInfo(user.uid)
          const q = query(
            collection(db, 'buyerInvoices'),
            where('buyerId', '==', user.uid)
          )
          const unsubscribeInvoices = onSnapshot(
            q,
            (snapshot) => {
              const invoiceData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as BuyerInvoice[]
              // Filter out invoices marked as hidden
              const visibleInvoices = invoiceData.filter(invoice => !invoice.hiddenForBuyer)
              setInvoices(visibleInvoices)
            },
            (error) => {
              console.error('Error listening to buyer invoices:', error)
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
      alert('No invoices selected')
      return
    }
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${selectedInvoices.length} invoice(s) from your view?`
    )
    if (!confirmDelete) return
    setDeleteStatus('Removing invoices...')
    try {
      const batch = writeBatch(db)
      for (const invoiceId of selectedInvoices) {
        const invoiceRef = doc(db, 'buyerInvoices', invoiceId)
        batch.update(invoiceRef, { hiddenForBuyer: true })
      }
      await batch.commit()
      setSelectedInvoices([])
      setDeleteStatus('Invoices removed successfully')
      alert('Invoice(s) removed successfully')
    } catch (error) {
      console.error('Error removing invoices:', error)
      setDeleteStatus(`Error: ${error}`)
      alert('Error removing invoice(s)')
    } finally {
      setTimeout(() => setDeleteStatus(null), 3000)
    }
  }

  const handleDownloadSelected = async () => {
    if (selectedInvoices.length === 0) {
      alert('No invoices selected for download')
      return
    }
    setDownloadStatus('Preparing downloads...')
    try {
      const selectedInvoiceObjects = invoices.filter(invoice =>
        selectedInvoices.includes(invoice.id)
      )
      if (selectedInvoiceObjects.length === 0) {
        setDownloadStatus('Error: Could not find selected invoices')
        setTimeout(() => setDownloadStatus(null), 3000)
        return
      }
      const success = await downloadMultipleInvoices(selectedInvoiceObjects, 'buyer-invoice')
      setDownloadStatus(success ? 'Invoices downloaded successfully' : 'Some invoices failed to download')
    } catch (error) {
      console.error('Error downloading invoices:', error)
      setDownloadStatus(`Error: ${error}`)
    } finally {
      setTimeout(() => setDownloadStatus(null), 3000)
    }
  }

  const handleToggleSearch = () => {
    setShowSearch(!showSearch)
  }

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) return invoices
    const lowerTerm = searchTerm.toLowerCase()
    return invoices.filter((invoice) => {
      const { invoiceData } = invoice
      return (
        invoiceData.invoiceNumber?.toLowerCase().includes(lowerTerm) ||
        invoiceData.senderName?.toLowerCase().includes(lowerTerm) ||
        invoiceData.items?.[0]?.description?.toLowerCase().includes(lowerTerm)
      )
    })
  }, [invoices, searchTerm])

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B85C1]"></div>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <div className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold font-nunito">
            Invoices
          </h1>
          <Header />
        </div>

        {/* Status messages */}
        {deleteStatus && (
          <div className={`p-3 mb-4 rounded ${deleteStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {deleteStatus}
          </div>
        )}
        {downloadStatus && (
          <div className={`p-3 mb-4 rounded ${downloadStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {downloadStatus}
          </div>
        )}

        {/* Search Input Field */}
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

        <InvoiceTable
          invoices={filteredInvoices}
          selectedInvoices={selectedInvoices}
          onSelect={handleInvoiceSelect}
          onDownloadAll={handleDownloadSelected}
          onDeleteSelected={handleDeleteSelected}
          onSearch={handleToggleSearch}
        />
      </div>
    </BaseLayout>
  )
}

export default InvoicesPage
