import React, { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../../../utils/firebase'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowDown, X } from 'lucide-react'
import { sendInvoiceToChat } from '../../../chat/InvoiceChatService'

interface Invoice {
    id: string
    vendorId: string
    buyerId: string
    status: string
    invoiceData: {
        invoiceNumber: string
        invoiceDate: string
        dueDate: string
        // other fields...
    }
    items?: Array<{
        id: number
        description: string
        quantity: number
        price: number
        tax: number
    }>
    totals?: {
        subtotal: number
        tax: number
        total: number
    }
    createdAt?: any
    updatedAt?: any
}

interface Buyer {
    id: string
    firstName: string
    lastName: string
    businessName: string
    email: string
}

interface InvoiceActionsProps {
    // Instead of (buyerId: string, isDraft: boolean),
    // pass a string for the status itself:
    onSave: (buyerId: string, status: 'Draft' | 'Unpaid') => Promise<void>

    invoiceData: {
        invoiceData: {
            invoiceNumber: string
            invoiceDate: string
            dueDate: string
            companyName: string
            companyEmail: string
            companyAddress: string
            companyLocation: string
            recipientPhone: string
            recipientAddress: string
            recipientLocation: string
            recipientName: string
            recipientEmail: string
            bankName: string
            bankAddress: string
            accountName: string
            iban: string
            bic: string
        }
        items: Array<{
            id: number
            description: string
            quantity: number
            price: number
            tax: number
        }>
        totals: {
            subtotal: number
            tax: number
            total: number
        }
    }
}

// Floating Alert Component
const SelectBuyerAlert = ({ show, onDismiss }) => {
    if (!show) return null;
    
    return (
        <div className="fixed bottom-24 left-25 z-50 animate-bounce">
            {/* Arrow pointing to the Select Buyer button */}
            <div className="relative flex items-center">
                <div className="bg-purple-600 text-white p-3 rounded-lg shadow-lg max-w-xs flex items-center space-x-2">
                    <ArrowDown className="w-6 h-6 text-white animate-pulse" />
                    <div>
                        <p className="font-bold">Important First Step!</p>
                        <p className="text-sm">Please select a buyer before proceeding</p>
                    </div>
                    <button 
                        onClick={onDismiss}
                        className="text-white hover:text-purple-200 ml-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* Arrow stem pointing down to the button */}
                <div className="absolute h-12 w-1 bg-purple-600 bottom-0 left-6 transform translate-y-full"></div>
            </div>
        </div>
    );
};

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
    invoiceData,
    onSave,
}) => {
    const [buyers, setBuyers] = useState<Buyer[]>([])
    const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [showBuyerList, setShowBuyerList] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sendToChat, setSendToChat] = useState(true) // Default to true
    const navigate = useNavigate()
    
    // Alert state
    const [showAlert, setShowAlert] = useState(false)
    
    useEffect(() => {
        fetchBuyers()
        
        // Show the alert after a short delay
        const alertTimer = setTimeout(() => {
            setShowAlert(true)
            
            // Auto-hide the alert after 10 seconds if not dismissed
            const hideTimer = setTimeout(() => {
                setShowAlert(false)
            }, 10000)
            
            return () => clearTimeout(hideTimer)
        }, 1000)
        
        return () => clearTimeout(alertTimer)
    }, [])

    // ---------------------
    // Fetch all Buyers
    // ---------------------
    const fetchBuyers = async () => {
        try {
            console.log('Starting to fetch buyers from Firestore...')
            const buyersRef = collection(db, 'users')
            const q = query(buyersRef, where('role', '==', 'buyer'))
            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
                console.log('No buyers found in the database')
                setError(
                    'No buyers found in the database. Make sure there are users with the role "buyer".'
                )
            } else {
                const buyersList = querySnapshot.docs.map((docSnapshot) => {
                    const data = docSnapshot.data()
                    console.log(
                        `Buyer found: ${docSnapshot.id} - Name: ${data.firstName} ${data.lastName}, Role: ${data.role}`
                    )
                    return { id: docSnapshot.id, ...data } as Buyer
                })
                setBuyers(buyersList)
            }
        } catch (err: any) {
            console.error('Error fetching buyers:', err)
            setError(`Error fetching buyers: ${err.message}`)
        }
    }

    const filteredBuyers = buyers.filter(
        (buyer) =>
            (buyer.businessName || '')
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            `${buyer.firstName || ''} ${buyer.lastName || ''}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    )

    const handleBuyerSelect = (buyer: Buyer) => {
        setSelectedBuyer(buyer)
        setShowBuyerList(false)
        // Hide the alert when buyer is selected
        setShowAlert(false)
    }

    // ---------------------
    // Handle "Save as Draft"
    // ---------------------
    const handleSaveAsDraft = async () => {
        if (!selectedBuyer) {
            alert('Please select a buyer first')
            return
        }
        setLoading(true)
        try {
            // Pass "Draft" so onSave sets status = "Draft"
            await onSave(selectedBuyer.id, 'Draft')
            alert('Invoice saved as draft')
        } catch (err: any) {
            console.error('Error saving draft:', err)
            alert(`Failed to save draft: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    // ---------------------
    // Handle "Send Invoice"
    // ---------------------
    const handleSendInvoice = async () => {
        if (!selectedBuyer) {
            alert('Please select a buyer first')
            // Show the alert again if they try to send without selecting
            setShowAlert(true)
            return
        }
        setLoading(true)
        try {
            // Pass "Unpaid" so onSave sets status = "Unpaid"
            await onSave(selectedBuyer.id, 'Unpaid').then(async () => {
                // Optionally also send to chat
                if (sendToChat) {
                    try {
                        // Find the newly created invoice (or the updated one) from Firestore
                        const vendorInvoicesRef = collection(
                            db,
                            'vendorInvoices'
                        )
                        const q = query(
                            vendorInvoicesRef,
                            where('buyerId', '==', selectedBuyer.id),
                            where(
                                'invoiceData.invoiceNumber',
                                '==',
                                invoiceData.invoiceData.invoiceNumber
                            )
                        )
                        const querySnapshot = await getDocs(q)

                        if (!querySnapshot.empty) {
                            const newInvoice = {
                                id: querySnapshot.docs[0].id,
                                ...querySnapshot.docs[0].data(),
                            } as Invoice

                            // Send to buyer's chat
                            const chatId = await sendInvoiceToChat(newInvoice)
                            console.log(`Invoice sent to chat: ${chatId}`)
                        }
                    } catch (chatError: any) {
                        console.error(
                            'Error sending invoice to chat:',
                            chatError
                        )
                        // If chat fails, don't block the main flow
                        alert(
                            `Invoice saved, but failed to send to chat: ${chatError.message}`
                        )
                    }
                }
                alert('Invoice sent successfully')
                navigate('/invoices')
            })
        } catch (err: any) {
            console.error('Error sending invoice:', err)
            alert(`Failed to send invoice: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Floating Alert Box pointing to Select Buyer */}
            <SelectBuyerAlert 
                show={showAlert} 
                onDismiss={() => setShowAlert(false)} 
            />
            
            <div className="p-4 bg-white rounded-lg shadow">
                <div className="mb-4">
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                        Select Buyer
                    </label>
                    <div className="relative">
                        <div className="flex items-center border rounded-lg">
                            <Search className="w-5 h-5 text-gray-400 ml-2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setShowBuyerList(true)
                                }}
                                onClick={() => setShowBuyerList(true)}
                                placeholder="Search buyers..."
                                className="w-full p-2 outline-none"
                                aria-label="Search for buyers"
                            />
                        </div>

                        {error && (
                            <div className="text-xs text-red-500 mt-1">
                                Error: {error}
                            </div>
                        )}

                        {showBuyerList && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                                {filteredBuyers.length > 0 ? (
                                    filteredBuyers.map((buyer) => (
                                        <div
                                            key={buyer.id}
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleBuyerSelect(buyer)}
                                        >
                                            <div className="font-medium">
                                                {buyer.businessName ||
                                                    `${buyer.firstName} ${buyer.lastName}`}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {buyer.firstName} {buyer.lastName} •{' '}
                                                {buyer.email}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">
                                        No buyers found.{' '}
                                        {buyers.length > 0
                                            ? 'Try a different search term.'
                                            : 'Make sure there are users with role "buyer" in the database.'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Show selected buyer info */}
                {selectedBuyer && (
                    <div className="mb-4 p-2 bg-purple-50 rounded-lg">
                        <div className="font-medium">Selected Buyer:</div>
                        <div className="text-sm">
                            {selectedBuyer.businessName || ''} (
                            {selectedBuyer.firstName || ''}{' '}
                            {selectedBuyer.lastName || ''})
                        </div>
                    </div>
                )}

                {/* Checkbox for sending to chat */}
                <div className="mb-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="sendToChat"
                            checked={sendToChat}
                            onChange={() => setSendToChat(!sendToChat)}
                            className="w-4 h-4 text-purple-600"
                        />
                        <label
                            htmlFor="sendToChat"
                            className="ml-2 text-sm text-gray-700"
                        >
                            Send invoice to buyer's chat with PDF attachment
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={handleSaveAsDraft}
                        disabled={loading || !selectedBuyer}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-[1.5rem] hover:bg-gray-300 disabled:opacity-50"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={handleSendInvoice}
                        disabled={loading || !selectedBuyer}
                        className="px-4 py-2 bg-[#7C77C1] text-white rounded-[1.5rem] hover:bg-[#6661B0] disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Invoice'}
                    </button>
                </div>
            </div>
        </>
    )
}

export default InvoiceActions