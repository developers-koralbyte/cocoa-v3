import React, { useState, useEffect } from 'react'
import InvoiceEditor from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceEditor'
import InvoiceSummary from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceSummary'
import SideBar from '../../../components/Dashboard/SideBar'
import InvoicePreview from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoicePreview'
import HeaderProps from '../../../components/Dashboard/Invoices/HeaderProps'
import { useUserStore } from '../../../utils/userStore'
import searchIcon from '../../../assets/icons/search.svg'
import downloadIcon from '../../../assets/icons/download.svg'
import deleteIcon from '../../../assets/icons/trash.svg'
import BaseLayout from '../../../components/Dashboard/BaseLayout'
const CreateNewInvoice = () => {
    const { currentUser, fetchUserInfo } = useUserStore()
    const [isPreview, setIsPreview] = useState(false)
    const [companyLogo, setCompanyLogo] = useState<string | null>(null)
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        companyName: '',
        companyEmail: '',
        companyAddress: '',
        companyLocation: '',
        recipientPhone: '',
        recipientAddress: '',
        recipientLocation: '',
        recipientName: '',
        recipientEmail: '',
        bankName: '',
        bankAddress: '',
        accountName: '',
        iban: '',
        bic: '',
    })

    const [items, setItems] = useState([
        {
            description: '',
            quantity: 1,
            rate: 0,
            tax: 10,
            id: Date.now(),
        },
    ])

    const [totals, setTotals] = useState({
        subtotal: 0,
        tax: 0,
        total: 0,
    })

    useEffect(() => {
        const newTotals = items.reduce(
            (acc, item) => {
                const itemTotal = item.quantity * item.rate
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

    const handleInvoiceDataChange = (name: string, value: string) => {
        setInvoiceData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleItemChange = (
        id: number,
        field: string,
        value: string | number
    ) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          [field]:
                              field === 'quantity' ||
                              field === 'rate' ||
                              field === 'tax'
                                  ? parseFloat(value as string) || 0
                                  : value,
                      }
                    : item
            )
        )
    }

    const handleAddItem = () => {
        setItems((prev) => [
            ...prev,
            {
                description: '',
                quantity: 1,
                rate: 0,
                tax: 10,
                id: Date.now(),
            },
        ])
    }

    const handleRemoveItem = (id: number) => {
        if (items.length > 1) {
            setItems((prev) => prev.filter((item) => item.id !== id))
        }
    }

    return (
        <BaseLayout>
            <div className="min-h-screen flex flex-col md:flex-row">
                {/* Main Content */}
                <div className="flex-1 p-4 md:p-6 flex flex-col gap-4">
                    {/* Top Section (Invoice Summary & Editor/Preview) */}
                    <div className="flex justify-between items-center">
                        {/* Left Section: Heading and Buttons */}
                        <div className="flex items-center gap-4">
                            {/* Heading */}
                            <h1 className="text-[60px] font-bold mb-0">
                                New Invoice
                            </h1>
                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(124,119,193,0.3)] hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)] transition-shadow">
                                    <img
                                        src={downloadIcon}
                                        alt="Download"
                                        className="w-[17.99px] h-[17.99px]"
                                    />
                                </button>
                                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(124,119,193,0.3)] hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)] transition-shadow">
                                    <img
                                        src={deleteIcon}
                                        alt="Delete"
                                        className="w-[17.99px] h-[17.99px]"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Right Section: HeaderProps */}
                        <div>
                            <HeaderProps
                                userName={currentUser?.username || 'User'}
                                userRole={currentUser?.role || 'Vendor'}
                                userImage={
                                    currentUser?.avatar ||
                                    '/path-to-default-avatar.jpg'
                                }
                            />
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Invoice Summary */}
                        <div className="w-full lg:w-1/3 space-y-4">
                            <InvoiceSummary
                                invoiceData={invoiceData}
                                totals={totals}
                            />
                        </div>

                        {/* Invoice Editor/Preview */}
                        <div className="w-full lg:w-2/3 space-y-4">
                            <InvoicePreview
                                invoiceData={invoiceData}
                                items={items}
                                totals={totals}
                                isPreview={isPreview}
                                onTogglePreview={() => setIsPreview(!isPreview)}
                                companyLogo={companyLogo}
                            />

                            {/* Only show the editor when not in preview mode */}
                            {!isPreview && (
                                <InvoiceEditor
                                    invoiceData={invoiceData}
                                    items={items}
                                    totals={totals}
                                    onInvoiceDataChange={
                                        handleInvoiceDataChange
                                    }
                                    onItemChange={handleItemChange}
                                    onAddItem={handleAddItem}
                                    onRemoveItem={handleRemoveItem}
                                    companyLogo={companyLogo}
                                    onLogoChange={setCompanyLogo}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    )
}

export default CreateNewInvoice
