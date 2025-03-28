import React from 'react'
import addLogoIcon from '../../../../assets/icons/addLogo.svg'

interface InvoiceData {
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

interface InvoiceItem {
    id: number
    description: string
    quantity: number
    rate: number
    tax: number
}

interface Totals {
    subtotal: number
    tax: number
    total: number
}

interface Props {
    invoiceData: InvoiceData
    items: InvoiceItem[]
    totals: Totals
    companyLogo?: string | null
    onLogoChange?: (logo: string | null) => void
    onInvoiceDataChange: (name: string, value: string) => void
    onItemChange?: (id: number, field: string, value: string | number) => void
    onAddItem?: () => void
    onRemoveItem?: (id: number) => void
}

const InvoiceEditor: React.FC<Props> = ({
    invoiceData,
    items,
    totals,
    companyLogo,
    onLogoChange,
    onInvoiceDataChange,
    onItemChange,
    onAddItem,
    onRemoveItem,
}) => {
    // Local state for items in case the parent is not handling changes.
    const [localItems, setLocalItems] = React.useState<InvoiceItem[]>(items)

    // If items prop changes, update local state.
    React.useEffect(() => {
        setLocalItems(items)
    }, [items])

    // Helper to update an item.
    const handleLocalItemChange = (id: number, field: string, value: string | number) => {
        setLocalItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          // Only convert to a number if the field is not "description"
                          [field]: field === 'description' ? value : Number(value),
                      }
                    : item
            )
        )
        // Call parent's callback if provided
        if (onItemChange) {
            onItemChange(id, field, value)
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        onInvoiceDataChange(name, value)
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        console.log('File selected:', file) // Debug log

        if (file && onLogoChange) {
            const reader = new FileReader()

            reader.onloadend = () => {
                console.log('File loaded:', reader.result) // Debug log
                onLogoChange(reader.result as string)
            }

            reader.onerror = (error) => {
                console.error('Error reading file:', error) // Error log
            }

            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="w-full p-6 border rounded-[3.5rem] shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[35px] font-bold text-[#5F4B8B]">Invoice</h1>
                    <div className="space-y-2">
                        <input
                            type="text"
                            name="invoiceNumber"
                            placeholder="Invoice Number"
                            value={invoiceData.invoiceNumber}
                            onChange={handleInputChange}
                            className="bg-transparent border-b border-gray-300 focus:border-purple-600 outline-none w-full"
                        />
                        <input
                            type="date"
                            name="invoiceDate"
                            value={invoiceData.invoiceDate}
                            onChange={handleInputChange}
                            className="bg-transparent border-b border-gray-300 focus:border-purple-600 outline-none w-full"
                        />
                        <input
                            type="date"
                            name="dueDate"
                            value={invoiceData.dueDate}
                            onChange={handleInputChange}
                            className="bg-transparent border-b border-gray-300 focus:border-purple-600 outline-none w-full"
                        />
                    </div>
                </div>

                {/* Logo Upload Section */}
                <div className="pr-10 pt-8">
                    <div className="relative w-24 h-24 bg-[#F3F0FA] rounded-full overflow-hidden">
                        {companyLogo ? (
                            <div className="relative w-full h-full group">
                                <img
                                    src={companyLogo}
                                    alt="Company Logo"
                                    className="w-full h-full object-contain"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <img
                                        src={addLogoIcon}
                                        alt="Change Logo"
                                        className="w-6 h-6 mb-1"
                                    />
                                </label>
                            </div>
                        ) : (
                            <label
                                htmlFor="logo-upload"
                                className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-[#E9E5F5] transition-colors"
                            >
                                <img
                                    src={addLogoIcon}
                                    alt="Add Logo"
                                    className="w-8 h-8 mb-2"
                                />
                                <span className="text-[#5F4B8B] text-sm">Add Logo</span>
                            </label>
                        )}
                        <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>

            {/* Company and Client Information */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Company Info */}
                <div>
                    <input
                        type="text"
                        name="companyName"
                        placeholder="Company Name"
                        value={invoiceData.companyName}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-gray-300 focus:border-purple-600 px-2 py-1 outline-none font-bold"
                    />
                    <input
                        type="email"
                        name="companyEmail"
                        placeholder="Company Email"
                        value={invoiceData.companyEmail}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-gray-300 focus:border-purple-600 px-2 py-1 outline-none"
                    />
                    <textarea
                        name="companyAddress"
                        placeholder="Company Address"
                        value={invoiceData.companyAddress}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-gray-300 focus:border-purple-600 px-2 py-1 outline-none"
                        rows={2}
                    />
                </div>

                {/* Client Info */}
                <div className="text-right space-y-2">
                    <h3 className="font-bold text-[#5F4B8B]">Invoice to</h3>
                    <input
                        type="text"
                        name="recipientName"
                        placeholder="Recipient Name"
                        value={invoiceData.recipientName}
                        onChange={handleInputChange}
                        className="bg-transparent border-b border-gray-300 focus:border-purple-600 outline-none w-full"
                    />
                    <input
                        type="text"
                        name="recipientPhone"
                        placeholder="Phone Number"
                        value={invoiceData.recipientPhone}
                        onChange={handleInputChange}
                        className="bg-transparent border-b border-gray-300 focus:border-purple-600 outline-none w-full"
                    />
                    <input
                        type="text"
                        name="recipientAddress"
                        placeholder="Address"
                        value={invoiceData.recipientAddress}
                        onChange={handleInputChange}
                        className="bg-transparent border-b border-gray-300 focus:border-purple-600 outline-none w-full"
                    />
                    <input
                        type="text"
                        name="recipientEmail"
                        placeholder="Email"
                        value={invoiceData.recipientEmail}
                        onChange={handleInputChange}
                        className="bg-transparent border-b border-gray-300 focus:border-purple-600 outline-none w-full"
                    />
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-[#EDE9F5] text-[#5F4B8B] font-bold">
                        <tr>
                            <th className="p-2">Description</th>
                            <th className="p-2 text-center">Qty</th>
                            <th className="p-2 text-center">Rate</th>
                            <th className="p-2 text-center">Tax %</th>
                            <th className="p-2 text-center">Amount</th>
                            <th className="p-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {localItems.map((item) => (
                            <tr key={item.id} className="bg-white hover:bg-gray-50">
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) =>
                                            handleLocalItemChange(
                                                item.id,
                                                'description',
                                                e.target.value
                                            )
                                        }
                                        className="w-full bg-transparent border-b border-gray-300 focus:border-purple-600 px-2 py-1 outline-none"
                                        placeholder="Item description"
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleLocalItemChange(
                                                item.id,
                                                'quantity',
                                                e.target.value
                                            )
                                        }
                                        className="w-16 bg-transparent border-b border-gray-300 focus:border-purple-600 px-2 py-1 text-center outline-none"
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) =>
                                            handleLocalItemChange(
                                                item.id,
                                                'rate',
                                                e.target.value
                                            )
                                        }
                                        className="w-20 bg-transparent border-b border-gray-300 focus:border-purple-600 px-2 py-1 text-center outline-none"
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <input
                                        type="number"
                                        value={item.tax}
                                        onChange={(e) =>
                                            handleLocalItemChange(
                                                item.id,
                                                'tax',
                                                e.target.value
                                            )
                                        }
                                        className="w-16 bg-transparent border-b border-gray-300 focus:border-purple-600 px-2 py-1 text-center outline-none"
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    CAD{' '}
                                    {(
                                        item.quantity *
                                        item.rate *
                                        (1 + item.tax / 100)
                                    ).toFixed(2)}
                                </td>
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() =>
                                            onRemoveItem ? onRemoveItem(item.id) : null
                                        }
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-[#F3F0FA]">
                        <tr>
                            <td colSpan={4} className="text-right p-2">
                                Subtotal:
                            </td>
                            <td className="text-center p-2">
                                CAD {totals.subtotal.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colSpan={4} className="text-right p-2">
                                Tax:
                            </td>
                            <td className="text-center p-2">
                                CAD {totals.tax.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                        <tr className="font-bold">
                            <td colSpan={4} className="text-right p-2">
                                Total:
                            </td>
                            <td className="text-center p-2">
                                CAD {totals.total.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Add Item Button */}
                <button
                    onClick={() => (onAddItem ? onAddItem() : null)}
                    className="mt-4 px-4 py-2 bg-[#5F4B8B] text-white rounded-full hover:bg-[#4a3a6d] transition-colors"
                >
                    + Add Item
                </button>
            </div>
        </div>
    )
}

export default InvoiceEditor
