import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../../../utils/firebase'
import { toast } from 'react-toastify'
import BaseLayout from '../../../components/Dashboard/BaseLayout'
import InvoiceEditor from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceEditor'
import InvoicePreview from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoicePreview'
import InvoiceSummary from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceSummary'
import InvoiceActions from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceAction'
import HeaderProps from '../../../components/Dashboard/Invoices/HeaderProps'
import { useUserStore } from '../../../utils/userStore'
import { calculateCanadianTaxes } from '../../../utils/canadianTax'

interface CatalogItem {
  id: string
  name: string
  description: string
  price: number
  type: 'product' | 'service'
}

// Updated BuyerInfo interface with firstName and businessName
export interface BuyerInfo {
  id: string
  firstName: string
  businessName: string
  recipientPhone: string
  recipientAddress: string
  recipientEmail: string
}

const CreateNewInvoice = () => {
  const navigate = useNavigate()
  const { currentUser, fetchUserInfo } = useUserStore() as any
  const [loading, setLoading] = useState(true)
  const [isPreview, setIsPreview] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // UPDATED INVOICE DATA with Canadian requirements
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    
    // EXISTING COMPANY INFO (keep for backward compatibility)
    companyName: '',
    companyEmail: '',
    companyAddress: '',
    companyLocation: '', // Keep this for backward compatibility
    
    // NEW CANADIAN REQUIRED FIELDS - Company
    businessCity: '',
    businessProvince: 'ON', // Default to Ontario, most common
    businessPostalCode: '',
    businessPhone: '',
    
    // GST/HST Registration - REQUIRED for tax
    gstNumber: '',
    isGstRegistered: false,
    
    // EXISTING RECIPIENT INFO  
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientLocation: '', // Keep for backward compatibility
    
    // NEW CANADIAN REQUIRED FIELDS - Client
    clientCity: '',
    clientProvince: 'ON', // Default to Ontario
    clientPostalCode: '',
    
    // PAYMENT INFO - REQUIRED by CRA
    paymentTerms: 'Due upon receipt', // Default
    paymentMethods: ['E-transfer'], // Default
    notes: '',
    
    // EXISTING BANK INFO (optional)
    bankName: '',
    bankAddress: '',
    accountName: '',
    iban: '',
    bic: '',
  })

  // UPDATED ITEMS STRUCTURE - using unitPrice instead of price, but keeping backward compatibility
  const [items, setItems] = useState([
    {
      id: Date.now(),
      description: '',
      quantity: 1,
      price: 0, // Keep this for backward compatibility with existing components
      unitPrice: 0, // Add this for Canadian compliance
      tax: 0, // Keep this for backward compatibility, but will be calculated automatically
    },
  ])

  // UPDATED TOTALS - Canadian tax structure but keeping backward compatibility
  const [totals, setTotals] = useState({ 
    subtotal: 0, 
    tax: 0, // Keep this for backward compatibility
    gst: 0,
    pst: 0, 
    hst: 0,
    totalTax: 0,
    total: 0 
  })

  // Combined catalog items for vendor
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])

  // NEW: State for buyers the vendor has chatted with
  const [chatBuyers, setChatBuyers] = useState<BuyerInfo[]>([])

  // Fetch buyer info from Firestore based on vendor's chat history.
  const fetchChatBuyers = async (vendorUid: string) => {
    try {
      const userChatsRef = doc(db, 'userchats', vendorUid)
      const userChatsSnap = await getDoc(userChatsRef)
      if (userChatsSnap.exists()) {
        const data = userChatsSnap.data()
        const chatsArray = data.chats || []
        // Extract unique buyer IDs
        const buyerIds = Array.from(
          new Set(chatsArray.map((chat: any) => chat.receiverId))
        )
        // For each buyer ID, fetch buyer info from Buyers collection
        const buyers: BuyerInfo[] = []
        for (const id of buyerIds) {
          const buyerDocRef = doc(db, 'Buyers', id as string)
          const buyerDocSnap = await getDoc(buyerDocRef)
          if (buyerDocSnap.exists()) {
            const buyerData = buyerDocSnap.data()
            buyers.push({
              id: id as string,
              firstName: buyerData.firstName || '',
              businessName: buyerData.businessName || '',
              recipientPhone: buyerData.phone || '',
              recipientAddress: buyerData.address || '',
              recipientEmail: buyerData.email || '',
            })
          }
        }
        setChatBuyers(buyers)
      }
    } catch (err) {
      console.error('Error fetching chat buyers:', err)
    }
  }

  // Fetch vendor details from Vendors collection
  const fetchVendorDetails = async (vendorUid: string) => {
    try {
      const vendorDocRef = doc(db, 'Vendors', vendorUid)
      const vendorDocSnap = await getDoc(vendorDocRef)
      if (vendorDocSnap.exists()) {
        const vendorData = vendorDocSnap.data()
        setInvoiceData((prev) => ({
          ...prev,
          companyName: vendorData.businessName || prev.companyName,
          companyLocation: vendorData.countryRegion || prev.companyLocation,
          // Map existing vendor data to new Canadian fields if available
          businessCity: vendorData.city || prev.businessCity,
          businessProvince: vendorData.province || prev.businessProvince,
          businessPostalCode: vendorData.postalCode || prev.businessPostalCode,
          businessPhone: vendorData.phone || prev.businessPhone,
        }))
      } else {
        console.warn('Vendor details not found in Vendors collection')
      }
    } catch (err) {
      console.error('Error fetching vendor details:', err)
    }
  }

  // Update invoiceData when currentUser becomes available.
  useEffect(() => {
    if (currentUser) {
      if (currentUser.uid) {
        fetchVendorDetails(currentUser.uid)
        fetchChatBuyers(currentUser.uid)
      }
      setInvoiceData((prev) => ({
        ...prev,
        companyEmail: currentUser.email || prev.companyEmail,
      }))
    }
  }, [currentUser])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) {
          navigate('/login')
          return
        }
        const user = JSON.parse(userData)
        if (!currentUser) {
          await fetchUserInfo(user.uid)
        }
        if (!currentUser && !user.uid) {
          throw new Error('User not authenticated')
        }
        if (user.role !== 'vendor') {
          navigate('/buyer-dashboard')
          return
        }
        if (user.uid) {
          await fetchVendorDetails(user.uid)
          await fetchChatBuyers(user.uid)
        }
        await fetchCatalog(user.uid)
        setLoading(false)
      } catch (err) {
        console.error('Error in auth check:', err)
        setError('Failed to load user data')
        setLoading(false)
      }
    }
    checkAuth()
  }, [navigate, fetchUserInfo])

  // Fetch catalog items (both products and services)
  const fetchCatalog = async (vendorUid: string) => {
    try {
      const productsRef = collection(db, 'products')
      const prodQuery = query(productsRef, where('vendorId', '==', vendorUid))
      const prodSnap = await getDocs(prodQuery)
      const fetchedProducts: CatalogItem[] = prodSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || 'Unnamed product',
        description: doc.data().description || '',
        price: doc.data().price || 0,
        type: 'product',
      }))

      const servicesRef = collection(db, 'services')
      const servQuery = query(servicesRef, where('vendorId', '==', vendorUid))
      const servSnap = await getDocs(servQuery)
      const fetchedServices: CatalogItem[] = servSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || 'Unnamed service',
        description: doc.data().description || '',
        price: doc.data().price || 0,
        type: 'service',
      }))

      setCatalogItems([...fetchedProducts, ...fetchedServices])
    } catch (err) {
      console.error('Error fetching catalog:', err)
      setError('Failed to fetch products/services')
    }
  }

  // FIXED TOTALS CALCULATION - Only calculate totals, don't update items
  useEffect(() => {
    const subtotal = items.reduce((acc, item) => {
      // Use unitPrice if available, otherwise fall back to price for backward compatibility
      const itemPrice = item.unitPrice || item.price || 0
      return acc + (item.quantity * itemPrice)
    }, 0)
    
    // Calculate Canadian taxes
    try {
      const taxCalc = calculateCanadianTaxes(
        subtotal, 
        invoiceData.businessProvince,
        invoiceData.isGstRegistered
      )
      
      setTotals({
        subtotal,
        tax: taxCalc.totalTax, // Keep this for backward compatibility
        gst: taxCalc.gst,
        pst: taxCalc.pst,
        hst: taxCalc.hst,
        totalTax: taxCalc.totalTax,
        total: taxCalc.total
      })
      
      // REMOVED: Don't update items here - this was causing the infinite loop
      
    } catch (error) {
      console.error('Error calculating Canadian taxes:', error)
      // Fallback to simple calculation
      setTotals({
        subtotal,
        tax: 0,
        gst: 0,
        pst: 0,
        hst: 0,
        totalTax: 0,
        total: subtotal
      })
    }
  }, [items, invoiceData.businessProvince, invoiceData.isGstRegistered])

  // When a buyer is selected from the dropdown, update recipient info
  const handleBuyerSelect = (buyer: BuyerInfo) => {
    setInvoiceData((prev) => ({
      ...prev,
      recipientName: `${buyer.firstName} ${buyer.businessName ? '(' + buyer.businessName + ')' : ''}`,
      recipientPhone: buyer.recipientPhone,
      recipientAddress: buyer.recipientAddress,
      recipientEmail: buyer.recipientEmail,
    }))
  }

  // FIXED: Memoized item change handler to prevent unnecessary re-renders
  const handleItemChange = useCallback((id: number, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === 'description'
                  ? value
                  : typeof value === 'string'
                  ? parseFloat(value) || 0
                  : value,
              // Sync price and unitPrice when either is changed
              ...(field === 'price' && { unitPrice: typeof value === 'string' ? parseFloat(value) || 0 : value }),
              ...(field === 'unitPrice' && { price: typeof value === 'string' ? parseFloat(value) || 0 : value }),
            }
          : item
      )
    )
  }, [])

  // FIXED: Memoized add item handler
  const handleAddItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: '',
        quantity: 1,
        price: 0, // Keep for backward compatibility
        unitPrice: 0, // New Canadian field
        tax: 0, // Keep for backward compatibility
      },
    ])
  }, [])

  // FIXED: Memoized remove item handler
  const handleRemoveItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // Handler for saving or sending invoice
  const handleSaveInvoice = async (buyerId: string, status: 'Draft' | 'Unpaid') => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const uid = currentUser?.uid || storedUser?.uid
      if (!uid) {
        throw new Error('User not authenticated')
      }
      const invoiceDoc = {
        vendorId: uid,
        buyerId,
        status: status,
        invoiceData: {
          ...invoiceData,
          items,
          totals,
          companyLogo,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, 'vendorInvoices'), invoiceDoc)
      if (status !== 'Draft') {
        const buyerInvoiceDoc = {
          ...invoiceDoc,
          status: 'Unpaid',
          vendorInvoiceId: docRef.id,
          receivedAt: serverTimestamp(),
        }
        await addDoc(collection(db, 'buyerInvoices'), buyerInvoiceDoc)
      }
      toast.success(
        status === 'Draft' ? 'Invoice saved as draft' : 'Invoice sent successfully'
      )
      navigate('/invoices')
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast.error(status === 'Draft' ? 'Failed to save draft' : 'Failed to send invoice')
    }
  }

  if (loading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B85C1]" />
        </div>
      </BaseLayout>
    )
  }

  if (error) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-red-500">Error: {error}</div>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">New Invoice</h1>
          <HeaderProps
            userName={currentUser?.firstName || 'User'}
            userRole={currentUser?.role || 'Vendor'}
            userImage={currentUser?.avatar || '/path-to-default-avatar.jpg'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <InvoiceSummary
              invoiceData={invoiceData}
              totals={totals}
              onInvoiceDataChange={(fieldName, value) =>
                setInvoiceData((prev) => ({
                  ...prev,
                  [fieldName]: value,
                }))
              }
            />
            <InvoiceActions
              invoiceData={{ invoiceData, items, totals }}
              onSave={handleSaveInvoice}
            />
          </div>

          <div className="lg:col-span-2">
            <InvoicePreview
              invoiceData={invoiceData}
              items={items}
              totals={totals}
              isPreview={isPreview}
              onTogglePreview={() => setIsPreview(!isPreview)}
              companyLogo={companyLogo}
            />

            {!isPreview && (
              <InvoiceEditor
                invoiceData={invoiceData}
                items={items}
                totals={totals}
                companyLogo={companyLogo}
                catalogItems={catalogItems}
                onLogoChange={setCompanyLogo}
                onInvoiceDataChange={(name, value) =>
                  setInvoiceData((prev) => ({
                    ...prev,
                    [name]: value,
                  }))
                }
                onItemChange={handleItemChange}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                chatBuyers={chatBuyers}
                onBuyerSelect={handleBuyerSelect}
              />
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default CreateNewInvoice