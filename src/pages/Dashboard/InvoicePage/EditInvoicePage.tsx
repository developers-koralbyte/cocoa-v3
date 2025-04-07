import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs,
} from 'firebase/firestore'
import { toast } from 'react-toastify'
import BaseLayout from '../../../components/Dashboard/BaseLayout'
import InvoiceEditor from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceEditor'
import InvoicePreview from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoicePreview'
import InvoiceSummary from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceSummary'
import InvoiceActions from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceAction'
import HeaderProps from '../../../components/Dashboard/Invoices/HeaderProps'
import { db } from '../../../utils/firebase'
import { useUserStore } from '../../../utils/userStore'

interface CatalogItem {
    id: string
    name: string
    description: string
    price: number
    type: 'product' | 'service'
}

export interface BuyerInfo {
    id: string
    firstName: string
    businessName: string
    recipientPhone: string
    recipientAddress: string
    recipientEmail: string
}

const EditInvoicePage: React.FC = () => {
    const navigate = useNavigate()
    const { invoiceId } = useParams() // get the :invoiceId from URL
    const { currentUser, fetchUserInfo } = useUserStore()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Preview toggler & logo
    const [isPreview, setIsPreview] = useState(false)
    const [companyLogo, setCompanyLogo] = useState<string | null>(null)

    // The invoice data fields
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        companyName: '',
        companyEmail: '',
        companyAddress: '',
        companyLocation: '',
        recipientName: '',
        recipientPhone: '',
        recipientAddress: '',
        recipientLocation: '',
        recipientEmail: '',
        bankName: '',
        bankAddress: '',
        accountName: '',
        iban: '',
        bic: '',
    })

    // Items array, each containing description, qty, price, tax, etc.
    const [items, setItems] = useState([
        {
            id: Date.now(),
            description: '',
            quantity: 1,
            price: 0,
            tax: 10,
        },
    ])

    // Totals updated automatically via useEffect
    const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 })

    // Catalog items, for “Select an item” dropdown in InvoiceEditor
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])

    // Chat-based buyer data (optional)
    const [chatBuyers, setChatBuyers] = useState<BuyerInfo[]>([])

    /**
     * 1) On mount, do the following:
     *    - fetch user info (if not already loaded)
     *    - confirm user is vendor
     *    - fetch existing invoice doc
     *    - fetch vendor's catalog items
     *    - fetch vendor's chatBuyers (if needed)
     */
    useEffect(() => {
        const init = async () => {
            try {
                // Check for invoiceId
                if (!invoiceId) {
                    setError('No invoice ID provided')
                    setLoading(false)
                    return
                }

                // Basic auth check
                const userData = localStorage.getItem('user')
                if (!userData) {
                    navigate('/login')
                    return
                }
                const user = JSON.parse(userData)

                // If user store isn't loaded yet, fetch it
                if (!currentUser) {
                    await fetchUserInfo(user.uid)
                }

                // Make sure user is vendor
                if (user.role !== 'vendor') {
                    navigate('/buyer-dashboard')
                    return
                }

                // 2) Fetch the invoice doc from Firestore
                const invoiceRef = doc(db, 'vendorInvoices', invoiceId)
                const invoiceSnap = await getDoc(invoiceRef)
                if (!invoiceSnap.exists()) {
                    setError('Invoice not found')
                    setLoading(false)
                    return
                }
                const invoiceDoc = invoiceSnap.data() as any

                // Populate local states
                if (invoiceDoc.invoiceData) {
                    setInvoiceData((prev) => ({
                        ...prev,
                        ...invoiceDoc.invoiceData,
                    }))
                    setItems(invoiceDoc.invoiceData.items || [])
                    setCompanyLogo(invoiceDoc.invoiceData.companyLogo || null)
                }

                // 3) Fetch vendor's catalog items
                await fetchCatalog(user.uid)

                // 4) If you want to populate chat buyers
                await fetchChatBuyers(user.uid)

                setLoading(false)
            } catch (err: any) {
                console.error('Error loading invoice for edit:', err)
                setError('Failed to load invoice data')
                setLoading(false)
            }
        }

        init()
    }, [invoiceId, currentUser, fetchUserInfo, navigate])

    /**
     * Recalculate totals whenever items change
     */
    useEffect(() => {
        const newTotals = items.reduce(
            (acc, item) => {
                const itemTotal = item.quantity * item.price
                const itemTax = (itemTotal * item.tax) / 100
                return {
                    subtotal: acc.subtotal + itemTotal,
                    tax: acc.tax + itemTax,
                    total: acc.total + itemTotal + itemTax,
                }
            },
            { subtotal: 0, tax: 0, total: 0 }
        )
        setTotals(newTotals)
    }, [items])

    /**
     * Handler to update existing invoice
     */
    const handleUpdateInvoice = async (buyerId: string, isDraft: boolean) => {
        try {
            if (!invoiceId) throw new Error('No invoice ID provided')
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
            const uid = currentUser?.uid || storedUser?.uid
            if (!uid) {
                throw new Error('User not authenticated')
            }

            // updated doc
            const updatedInvoiceDoc = {
                vendorId: uid,
                buyerId,
                status: isDraft ? 'Draft' : 'Sent, Unpaid',
                invoiceData: {
                    ...invoiceData,
                    items,
                    totals,
                    companyLogo,
                },
                updatedAt: serverTimestamp(),
            }

            // update vendorInvoices doc
            const invoiceRef = doc(db, 'vendorInvoices', invoiceId)
            await updateDoc(invoiceRef, updatedInvoiceDoc)

            toast.success(
                isDraft
                    ? 'Invoice draft updated'
                    : 'Invoice updated and re-sent'
            )
            navigate('/invoices')
        } catch (error) {
            console.error('Error updating invoice:', error)
            toast.error(
                isDraft ? 'Failed to update draft' : 'Failed to update invoice'
            )
        }
    }

    /**
     * If user selects a buyer from chat, update invoiceData's recipient fields
     */
    const handleBuyerSelect = (buyer: BuyerInfo) => {
        setInvoiceData((prev) => ({
            ...prev,
            recipientName: `${buyer.firstName}${
                buyer.businessName ? ' (' + buyer.businessName + ')' : ''
            }`,
            recipientPhone: buyer.recipientPhone,
            recipientAddress: buyer.recipientAddress,
            recipientEmail: buyer.recipientEmail,
        }))
    }

    /**
     * Fetch vendor's catalog from "products" & "services" collection
     */
    const fetchCatalog = async (vendorUid: string) => {
        try {
            const productsRef = collection(db, 'products')
            const prodQuery = query(
                productsRef,
                where('vendorId', '==', vendorUid)
            )
            const prodSnap = await getDocs(prodQuery)
            const fetchedProducts: CatalogItem[] = prodSnap.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name || 'Unnamed product',
                description: doc.data().description || '',
                price: doc.data().price || 0,
                type: 'product',
            }))

            const servicesRef = collection(db, 'services')
            const servQuery = query(
                servicesRef,
                where('vendorId', '==', vendorUid)
            )
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
            // handle error
        }
    }

    /**
     * Example of fetching chat-based buyers
     */
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
            // handle error
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
                    <h1 className="text-4xl font-bold">
                        Edit Invoice #{invoiceData.invoiceNumber}
                    </h1>
                    <HeaderProps
                        userName={currentUser?.firstName || 'User'}
                        userRole={currentUser?.role || 'Vendor'}
                        userImage={
                            currentUser?.avatar || '/path-to-default-avatar.jpg'
                        }
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
                            onSave={handleUpdateInvoice}
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
                                catalogItems={catalogItems} // <-- We pass the catalog to the editor
                                onLogoChange={setCompanyLogo}
                                onInvoiceDataChange={(name, value) =>
                                    setInvoiceData((prev) => ({
                                        ...prev,
                                        [name]: value,
                                    }))
                                }
                                onItemChange={(id, field, value) =>
                                    setItems((prev) =>
                                        prev.map((item) =>
                                            item.id === id
                                                ? {
                                                      ...item,
                                                      [field]:
                                                          field ===
                                                          'description'
                                                              ? value
                                                              : typeof value ===
                                                                  'string'
                                                                ? parseFloat(
                                                                      value
                                                                  ) || 0
                                                                : value,
                                                  }
                                                : item
                                        )
                                    )
                                }
                                onAddItem={() =>
                                    setItems((prev) => [
                                        ...prev,
                                        {
                                            id: Date.now(),
                                            description: '',
                                            quantity: 1,
                                            price: 0,
                                            tax: 10,
                                        },
                                    ])
                                }
                                onRemoveItem={(id) =>
                                    setItems((prev) =>
                                        prev.filter((item) => item.id !== id)
                                    )
                                }
                                chatBuyers={chatBuyers} // <-- we pass the chat buyer list here
                                onBuyerSelect={handleBuyerSelect}
                            />
                        )}
                    </div>
                </div>
            </div>
        </BaseLayout>
    )
}

export default EditInvoicePage
