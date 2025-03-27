import React from 'react'

interface InvoiceData {
    invoiceNumber: string
    invoiceDate: string
    dueDate: string
}

interface Totals {
    total: number
}

interface InvoiceSummaryProps {
    invoiceData: InvoiceData
    totals: Totals
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
    invoiceData,
    totals,
}) => {
    return (
        <div className="sm:p-6 md:p-1">
            {/* Title */}
            <h2 className="text-[35px] font-nunito font-semibold text-[#8B85C1] mb-2">
                Summary
            </h2>

            {/* Invoice Number */}
            <div
                className="bg-[#F8F5F5] p-3 rounded-md mb-[0.20rem] 
                      flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
                <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
                    Invoice Number
                </span>
                <span className="text-base sm:text-lg font-semibold">
                    {invoiceData.invoiceNumber}
                </span>
            </div>

            {/* Invoice Date */}
            <div
                className="bg-[#F8F5F5] p-3 rounded-md mb-[0.20rem]
                      flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
                <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
                    Invoice Date
                </span>
                <span className="text-base sm:text-lg font-semibold">
                    {invoiceData.invoiceDate}
                </span>
            </div>

            {/* Invoice Due */}
            <div
                className="bg-[#F8F5F5] p-3 rounded-md mb-8 
                      flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
                <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
                    Invoice Due
                </span>
                <span className="text-base sm:text-lg font-semibold">
                    {invoiceData.dueDate}
                </span>
            </div>

            {/* Invoice Amount */}
            <div
                className="bg-[#F8F5F5] p-3 rounded-md mb-1 
                      flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
                <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
                    Invoice amount
                </span>
                <span className="text-base sm:text-lg font-semibold">
                    CAD {totals.total.toFixed(2)}
                </span>
            </div>

            {/* Invoice Location */}
            <div
                className="bg-[#F8F5F5] p-3 rounded-md mb-[0.20rem] 
                      flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
                <span className="text-[#000000] font-nunito font-semibold flex items-center mb-2 sm:mb-0">
                    Invoice Location
                    <svg
                        className="w-4 h-4 ml-1 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 6a1 1 0 100-2 1 1 0 000 2zm0 3a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 000-2v-3a1 1 0 000-2H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
                <span className="text-base sm:text-lg font-semibold">
                    Canada
                </span>
            </div>

            {/* Card Checkout - Coming Soon */}
            <div className="bg-[#F8F5F5] p-3 rounded-md mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
                    Card Checkout
                </span>
                <span className="text-base sm:text-lg font-semibold text-[#701919]">
                    Coming Soon
                </span>
            </div>

            {/* Instant Payout - Coming Soon */}
            <div className="bg-[#F8F5F5] p-3 rounded-md mb-[0.20rem] flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
                    Instant Payout
                </span>
                <span className="text-base sm:text-lg font-semibold text-[#701919]">
                    Coming Soon
                </span>
            </div>

            {/* Contract Upload - Coming Soon */}
            <div className="bg-[#F8F5F5] p-3 rounded-md mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
                    Contract Upload
                </span>
                <span className="text-base sm:text-lg font-semibold text-[#701919]">
                    Coming Soon
                </span>
            </div>

            {/*
            // The following sections are commented out for now as we don't need them.
            
            {/* Our Fee */}
            {/* 
            <div
                className="bg-[#F8F5F5] p-3 rounded-md mb-[0.20rem] 
                      flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
                <span className="text-[#000000] font-nunito font-bold flex items-center mb-2 sm:mb-0">
                    Our Fee
                    <svg
                        className="w-4 h-4 ml-1 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
                <span className="text-base sm:text-lg font-semibold">2%</span>
            </div>
            
            {/* Your Payout 
            <div
                className="bg-[#F8F5F5] p-3 rounded-md mb-5 
                      flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
                <span className="text-[#000000] font-nunito font-semibold mb-2 sm:mb-0">
                    Your Payout
                </span>
                <span className="text-base sm:text-lg font-semibold">
                    CAD {(totals.total * 0.98).toFixed(2)}
                </span>
            </div>
            */}
        </div>
    )
}

export default InvoiceSummary
