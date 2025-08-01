// File: InvoicePreview.tsx

import React, { useState, useEffect } from 'react'
import { Eye, Edit2 } from 'lucide-react'
import { CANADIAN_TAX_RATES } from '../../../../utils/canadianTax'

// ---------------------------------------------
// 1) Updated interfaces to support Canadian tax fields
// ---------------------------------------------
interface InvoiceItem {
  id: number
  description: string
  quantity?: number
  price?: number
  unitPrice?: number // Canadian field
  tax?: number
}

interface Totals {
  subtotal?: number
  tax?: number
  // Canadian tax fields
  gst?: number
  pst?: number
  hst?: number
  totalTax?: number
  total?: number
}

interface InvoiceData {
  invoiceNumber?: string
  invoiceDate?: string
  dueDate?: string
  companyName?: string
  companyEmail?: string
  companyAddress?: string
  companyLocation?: string
  recipientName?: string
  recipientPhone?: string
  recipientEmail?: string
  recipientAddress?: string
  bankName?: string
  bankAddress?: string
  accountName?: string
  iban?: string
  bic?: string
  // Canadian fields
  businessCity?: string
  businessProvince?: string
  businessPostalCode?: string
  businessPhone?: string
  gstNumber?: string
  isGstRegistered?: boolean
  clientCity?: string
  clientProvince?: string
  clientPostalCode?: string
  paymentTerms?: string
  paymentMethods?: string[]
  notes?: string
}

// ---------------------------------------------
// 2) The read-only invoice preview with Canadian tax support
// ---------------------------------------------
interface BaseInvoicePreviewProps {
  companyLogo?: string | null
  invoiceData: InvoiceData
  items: InvoiceItem[]
  totals: Totals
}

const BaseInvoicePreview: React.FC<BaseInvoicePreviewProps> = ({
  companyLogo,
  invoiceData,
  items,
  totals,
}) => {
  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)
  const [isTablet, setIsTablet] = useState(
    window.innerWidth > 640 && window.innerWidth <= 1024
  )

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width <= 640)
      setIsTablet(width > 640 && width <= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const grandTotal = totals.total ?? 0
  const subTotal = totals.subtotal ?? 0
  
  // Determine which tax to show - Canadian or legacy
  const showCanadianTax = invoiceData.isGstRegistered && invoiceData.businessProvince
  const taxConfig = showCanadianTax ? CANADIAN_TAX_RATES[invoiceData.businessProvince?.toUpperCase() || ''] : null
  
  // Get tax information
  const gstAmount = totals.gst ?? 0
  const pstAmount = totals.pst ?? 0
  const hstAmount = totals.hst ?? 0
  const totalTaxAmount = totals.totalTax ?? totals.tax ?? 0
  
  // Format business address for display
  const formatBusinessAddress = () => {
    if (invoiceData.businessCity && invoiceData.businessProvince) {
      return `${invoiceData.companyAddress || ''}, ${invoiceData.businessCity}, ${invoiceData.businessProvince} ${invoiceData.businessPostalCode || ''}`.trim()
    }
    return invoiceData.companyAddress || invoiceData.companyLocation || ''
  }

  // Format client address for display
  const formatClientAddress = () => {
    if (invoiceData.clientCity && invoiceData.clientProvince) {
      return `${invoiceData.recipientAddress || ''}, ${invoiceData.clientCity}, ${invoiceData.clientProvince} ${invoiceData.clientPostalCode || ''}`.trim()
    }
    return invoiceData.recipientAddress || ''
  }

  return (
    <div className={`w-full ${isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'} bg-white border ${isMobile ? 'rounded-2xl' : 'rounded-[3.5rem]'} shadow-2xl overflow-hidden`}>
      {/* Header Section - Responsive */}
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-start'} ${isMobile ? 'mb-6' : 'mb-12'}`}>
        <div className={isMobile ? 'order-2' : ''}>
          <h1 className={`${isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-[35px]'} font-nunito font-bold text-[#5F4B8B] ${isMobile ? 'mb-3' : 'mb-4'}`}>
            Invoice
          </h1>
          <div className={`font-sourceSans ${isMobile ? 'text-sm' : 'text-[16px]'} text-[#5F4B8B]`}>
            <p className="mb-1 font-bold">
              Invoice No: {invoiceData.invoiceNumber ?? 'N/A'}
            </p>
            <p className="mb-1">
              Invoice Date: {invoiceData.invoiceDate ?? 'N/A'}
            </p>
            <p>Due Date: {invoiceData.dueDate ?? 'N/A'}</p>
          </div>
        </div>
        
        {/* Logo - Responsive */}
        <div className={`${isMobile ? 'order-1 self-center' : isTablet ? 'pr-6 pt-6' : 'pr-10 pt-8'}`}>
          <div className={`relative ${isMobile ? 'w-16 h-16' : isTablet ? 'w-20 h-20' : 'w-24 h-24'} bg-[#F3F0FA] rounded-full overflow-hidden`}>
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className={`${isMobile ? 'w-8 h-8' : isTablet ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-[#5F4B8B] opacity-20`} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company and Client Info - Responsive Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-8'} ${isMobile ? 'mb-6' : 'mb-8'}`}>
        <div>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-[#5F4B8B] mb-2`}>
            {invoiceData.companyName ?? 'N/A'}
          </h3>
          <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 space-y-1`}>
            {invoiceData.companyEmail && <p>{invoiceData.companyEmail}</p>}
            {formatBusinessAddress() && <p>{formatBusinessAddress()}</p>}
            {invoiceData.businessPhone && <p>{invoiceData.businessPhone}</p>}
            {/* Show GST number if registered */}
            {invoiceData.isGstRegistered && invoiceData.gstNumber && (
              <p className={`mt-2 ${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-[#5F4B8B]`}>
                GST/HST #: {invoiceData.gstNumber}
              </p>
            )}
          </div>
        </div>
        
        <div className={`${isMobile ? 'text-left' : 'text-right'}`}>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-[#5F4B8B] mb-2`}>
            Invoice to
          </h3>
          <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 space-y-1`}>
            {invoiceData.recipientName && <p>{invoiceData.recipientName}</p>}
            {invoiceData.recipientPhone && <p>{invoiceData.recipientPhone}</p>}
            {invoiceData.recipientEmail && <p>{invoiceData.recipientEmail}</p>}
            {formatClientAddress() && <p>{formatClientAddress()}</p>}
          </div>
        </div>
      </div>

      {/* Due Amount Section - Responsive */}
      <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
        <p className={`text-[#5F4B8B] font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>
          CAD {grandTotal.toFixed(2)} due on {invoiceData.dueDate ?? 'N/A'}
        </p>
        {invoiceData.paymentTerms && (
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mt-1`}>
            Payment Terms: {invoiceData.paymentTerms}
          </p>
        )}
      </div>

      {/* Items Table - Responsive */}
      <div className={`${isMobile ? 'mb-4' : 'mb-5'} overflow-x-auto`}>
        {isMobile ? (
          /* Mobile Card Layout */
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[#5F4B8B] mb-3">Items</h4>
            {items.map((item) => {
              const safePrice = (item.unitPrice || item.price) ?? 0
              const safeQty = item.quantity ?? 0
              const safeTax = item.tax ?? 0
              const lineAmount = safeQty * safePrice

              return (
                <div key={item.id} className="bg-[#F3F0FA] p-4 rounded-lg border">
                  <h5 className="font-semibold text-[#5F4B8B] mb-2">
                    {item.description ?? 'N/A'}
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Qty:</span>
                      <span className="ml-2 font-medium">{safeQty}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-2 font-medium">CAD {safePrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tax:</span>
                      <span className="ml-2 font-medium">
                        {showCanadianTax ? 'Included' : `${safeTax}%`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-2 font-medium">CAD {lineAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Desktop/Tablet Table Layout */
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#F3F0FA] text-[#5F4B8B]">
              <tr>
                <th className={`${isTablet ? 'py-2 px-3' : 'py-3 px-4'} text-left ${isTablet ? 'text-sm' : 'text-base'}`}>
                  Description
                </th>
                <th className={`${isTablet ? 'py-2 px-3' : 'py-3 px-4'} text-center ${isTablet ? 'text-sm' : 'text-base'}`}>
                  Qty
                </th>
                <th className={`${isTablet ? 'py-2 px-3' : 'py-3 px-4'} text-center ${isTablet ? 'text-sm' : 'text-base'}`}>
                  Price
                </th>
                <th className={`${isTablet ? 'py-2 px-3' : 'py-3 px-4'} text-center ${isTablet ? 'text-sm' : 'text-base'}`}>
                  Tax
                </th>
                <th className={`${isTablet ? 'py-2 px-3' : 'py-3 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#F3F0FA]">
              {items.map((item) => {
                const safePrice = (item.unitPrice || item.price) ?? 0
                const safeQty = item.quantity ?? 0
                const safeTax = item.tax ?? 0
                const lineAmount = safeQty * safePrice

                return (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className={`${isTablet ? 'py-2 px-3' : 'py-3 px-4'} ${isTablet ? 'text-sm' : 'text-base'}`}>
                      {item.description ?? 'N/A'}
                    </td>
                    <td className={`${isTablet ? 'py-2 px-3' : 'py-3 px-4'} text-center ${isTablet ? 'text-sm' : 'text-base'}`}>
                      {safeQty}
                    </td>
                    <td className={`${isTablet ? 'py-2 px-3' : 'py-3 px-4'} text-center ${isTablet ? 'text-sm' : 'text-base'}`}>
                      CAD {safePrice.toFixed(2)}
                    </td>
                    <td className={`${isTablet ? 'py-2 px-3' : 'py-3 px-4'} text-center ${isTablet ? 'text-sm' : 'text-base'}`}>
                      {showCanadianTax ? 'Included' : `${safeTax}%`}
                    </td>
                    <td className={`${isTablet ? 'py-2 px-3' : 'py-3 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                      CAD {lineAmount.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Totals Section - Always shown after items */}
        <div className={`${isMobile ? 'mt-6 space-y-2' : 'mt-4'}`}>
          {isMobile ? (
            /* Mobile Totals Layout */
            <div className="bg-[#F3F0FA] p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#5F4B8B] font-medium">Total ex. Tax:</span>
                <span className="font-semibold">CAD {subTotal.toFixed(2)}</span>
              </div>
              
              {/* Canadian Tax Display */}
              {showCanadianTax ? (
                <>
                  {gstAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5F4B8B]">GST (5%):</span>
                      <span>CAD {gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {pstAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5F4B8B]">PST ({taxConfig?.pstRate}%):</span>
                      <span>CAD {pstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {hstAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5F4B8B]">HST ({taxConfig?.hstRate}%):</span>
                      <span>CAD {hstAmount.toFixed(2)}</span>
                    </div>
                  )}
                </>
              ) : (
                /* Legacy Tax Display */
                <div className="flex justify-between text-sm">
                  <span className="text-[#5F4B8B]">Tax ({items[0]?.tax ?? 0}%):</span>
                  <span>CAD {(totals.tax ?? 0).toFixed(2)}</span>
                </div>
              )}
              
              <hr className="border-gray-300" />
              <div className="flex justify-between font-bold text-[#5F4B8B]">
                <span>Total due:</span>
                <span>CAD {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            /* Desktop/Tablet Totals Layout */
            <table className="w-full">
              <tfoot className="bg-[#F3F0FA] text-[#5F4B8B]">
                <tr>
                  <td colSpan={4} className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                    Total ex. Tax
                  </td>
                  <td className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                    CAD {subTotal.toFixed(2)}
                  </td>
                </tr>
                
                {/* Canadian Tax Display */}
                {showCanadianTax ? (
                  <>
                    {gstAmount > 0 && (
                      <tr>
                        <td colSpan={4} className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                          GST (5%)
                        </td>
                        <td className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                          CAD {gstAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {pstAmount > 0 && (
                      <tr>
                        <td colSpan={4} className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                          PST ({taxConfig?.pstRate}%)
                        </td>
                        <td className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                          CAD {pstAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {hstAmount > 0 && (
                      <tr>
                        <td colSpan={4} className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                          HST ({taxConfig?.hstRate}%)
                        </td>
                        <td className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                          CAD {hstAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {!invoiceData.isGstRegistered && totalTaxAmount === 0 && (
                      <tr>
                        <td colSpan={4} className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-xs' : 'text-sm'}`}>
                          No tax applied - not registered for GST/HST
                        </td>
                        <td className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                          CAD 0.00
                        </td>
                      </tr>
                    )}
                    {invoiceData.isGstRegistered && totalTaxAmount === 0 && (
                      <tr>
                        <td colSpan={4} className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-xs' : 'text-sm'}`}>
                          Tax calculated at 0% (exempt items or error)
                        </td>
                        <td className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                          CAD 0.00
                        </td>
                      </tr>
                    )}
                  </>
                ) : (
                  /* Legacy Tax Display */
                  <tr>
                    <td colSpan={4} className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                      Tax ({items[0]?.tax ?? 0}%)
                    </td>
                    <td className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                      CAD {(totals.tax ?? 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                
                <tr className="font-bold">
                  <td colSpan={4} className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                    Total due
                  </td>
                  <td className={`${isTablet ? 'py-1 px-3' : 'py-2 px-4'} text-right ${isTablet ? 'text-sm' : 'text-base'}`}>
                    CAD {grandTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* Additional Canadian Information - Responsive */}
      {invoiceData.paymentMethods && invoiceData.paymentMethods.length > 0 && (
        <div className="mb-4">
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[#5F4B8B] font-semibold mb-1`}>
            Accepted Payment Methods:
          </p>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
            {invoiceData.paymentMethods.join(', ')}
          </p>
        </div>
      )}

      {invoiceData.notes && (
        <div className="mb-4">
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[#5F4B8B] font-semibold mb-1`}>
            Notes:
          </p>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 whitespace-pre-wrap`}>
            {invoiceData.notes}
          </p>
        </div>
      )}

      {/* CRA Compliance Note - Responsive */}
      {showCanadianTax && (
        <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 text-center mt-4 pt-4 border-t border-gray-200`}>
          This invoice meets Canada Revenue Agency (CRA) requirements
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------
// 3) The container that can toggle edit/preview - Responsive
// ---------------------------------------------
export interface InvoicePreviewContainerProps extends BaseInvoicePreviewProps {
  isPreview: boolean
  onTogglePreview?: () => void
  hideEditButton?: boolean
}

const InvoicePreview: React.FC<InvoicePreviewContainerProps> = ({
  invoiceData,
  items,
  totals,
  companyLogo,
  isPreview,
  onTogglePreview,
  hideEditButton = false,
}) => {
  // Responsive state for button
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative">
      {!hideEditButton && (
        <button
          onClick={() => onTogglePreview?.()}
          className={`absolute left-1/2 transform -translate-x-1/2 ${isMobile ? 'top-2' : 'top-8'} z-10 flex items-center gap-2 bg-buttonBg text-white ${
            isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-2 text-base'
          } rounded-full hover:bg-[#4a3a6d] transition-colors shadow-lg`}
        >
          {isPreview ? (
            <>
              <Edit2 size={isMobile ? 16 : 20} />
              <span>Edit</span>
            </>
          ) : (
            <>
              <Eye size={isMobile ? 16 : 20} />
              <span>Preview</span>
            </>
          )}
        </button>
      )}

      {isPreview && (
        <BaseInvoicePreview
          companyLogo={companyLogo}
          invoiceData={invoiceData}
          items={items}
          totals={totals}
        />
      )}
    </div>
  )
}

export default InvoicePreview