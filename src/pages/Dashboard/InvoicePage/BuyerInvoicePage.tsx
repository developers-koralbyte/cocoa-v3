import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BaseLayout from '../../../components/Dashboard/BaseLayout'
import chatImage from '../../../assets/img/Dashboard/chatImage.png'
import Header from '../../../components/Dashboard/Invoices/HeaderProps'
import InvoiceTable from '../../../components/Dashboard/Invoices/BuyerInvoiceTable'
import { useUserStore } from '../../../utils/userStore'
import { auth, db } from '../../../utils/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

interface Invoice {
    id: string
    date: string
    invoiceNumber: string
    productName: string
    sender: string
    service: string
    status: 'Paid' | 'Unpaid' | 'Cancelled'
    amount: string
}

const InvoicesPage = () => {
    const navigate = useNavigate()
    const { currentUser, fetchUserInfo } = useUserStore()
    const [isLoading, setIsLoading] = useState(true)
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    await fetchUserInfo(user.uid)
                    await fetchInvoices(user.uid)
                } catch (error) {
                    console.error('Error fetching user info:', error)
                    navigate('/login')
                }
            } else {
                navigate('/login')
            }
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [fetchUserInfo, navigate])

    const fetchInvoices = async (userId: string) => {
        try {
            const q = query(
                collection(db, 'invoices'),
                where('userId', '==', userId)
            )
            const querySnapshot = await getDocs(q)
            const invoiceData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Invoice[]
            setInvoices(invoiceData)
        } catch (error) {
            console.error('Error fetching invoices:', error)
        }
    }

    const handleInvoiceSelect = (invoiceId: string) => {
        setSelectedInvoices((prev) => {
            if (prev.includes(invoiceId)) {
                return prev.filter((id) => id !== invoiceId)
            }
            return [...prev, invoiceId]
        })
    }

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
                    <Header
                        userName={currentUser?.username || 'User'}
                        userRole={currentUser?.role || 'Buyer'}
                        userImage={
                            currentUser?.avatar || '/path-to-default-avatar.jpg'
                        }
                    />
                </div>

                {/* Invoice Table */}
                <InvoiceTable
                    invoices={invoices}
                    selectedInvoices={selectedInvoices}
                    onSelect={handleInvoiceSelect}
                />
            </div>

            {/* Chat Button */}
            {/* <div
        className="fixed bottom-3 right-10 cursor-pointer z-50"
        onClick={() => navigate('/chat')}
      >
        <img
          src={chatImage}
          alt="Chat"
          className="hover:opacity-90 transition-opacity"
        />
      </div> */}
        </BaseLayout>
    )
}

export default InvoicesPage
