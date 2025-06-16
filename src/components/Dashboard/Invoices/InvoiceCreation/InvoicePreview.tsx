// File: InvoicePreview.tsx

import React from 'react'
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
    <div className="w-full p-8 bg-white border rounded-[3.5rem] shadow-2xl">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-[35px] font-nunito font-bold text-[#5F4B8B] mb-4">
            Invoice
          </h1>
          <div className="font-sourceSans text-[16px] text-[#5F4B8B]">
            <p className="mb-1 font-bold">
              Invoice No : {invoiceData.invoiceNumber ?? 'N/A'}
            </p>
            <p className="mb-1">
              Invoice Date : {invoiceData.invoiceDate ?? 'N/A'}
            </p>
            <p>Due Date : {invoiceData.dueDate ?? 'N/A'}</p>
          </div>
        </div>
        <div className="pr-10 pt-8">
          <div className="relative w-24 h-24 bg-[#F3F0FA] rounded-full overflow-hidden">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#5F4B8B] opacity-20" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-[#5F4B8B] mb-2">
            {invoiceData.companyName ?? 'N/A'}
          </h3>
          <p>{invoiceData.companyEmail ?? ''}</p>
          <p>{formatBusinessAddress()}</p>
          {invoiceData.businessPhone && <p>{invoiceData.businessPhone}</p>}
          {/* Show GST number if registered */}
          {invoiceData.isGstRegistered && invoiceData.gstNumber && (
            <p className="mt-2 text-sm font-semibold text-[#5F4B8B]">
              GST/HST #: {invoiceData.gstNumber}
            </p>
          )}
        </div>
        <div className="text-right">
          <h3 className="text-xl font-bold text-[#5F4B8B] mb-2">Invoice to</h3>
          <p>{invoiceData.recipientName ?? ''}</p>
          <p>{invoiceData.recipientPhone ?? ''}</p>
          <p>{invoiceData.recipientEmail ?? ''}</p>
          <p>{formatClientAddress()}</p>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-[#5F4B8B] font-bold text-lg">
          CAD {grandTotal.toFixed(2)} due on {invoiceData.dueDate ?? 'N/A'}
        </p>
        {invoiceData.paymentTerms && (
          <p className="text-sm text-gray-600 mt-1">
            Payment Terms: {invoiceData.paymentTerms}
          </p>
        )}
      </div>

      <div className="mb-5">
        <table className="w-full">
          <thead className="bg-[#F3F0FA] text-[#5F4B8B]">
            <tr>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-center">Price</th>
              <th className="py-3 px-4 text-center">Tax</th>
              <th className="py-3 px-4 text-right">Amount</th>
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
                  <td className="py-3 px-4">{item.description ?? 'N/A'}</td>
                  <td className="py-3 px-4 text-center">{safeQty}</td>
                  <td className="py-3 px-4 text-center">
                    CAD {safePrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {showCanadianTax ? 'Included' : `${safeTax}%`}
                  </td>
                  <td className="py-3 px-4 text-right">
                    CAD {lineAmount.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-[#F3F0FA] text-[#5F4B8B]">
            <tr>
              <td colSpan={4} className="py-2 px-4 text-right">
                Total ex. Tax
              </td>
              <td className="py-2 px-4 text-right">
                CAD {subTotal.toFixed(2)}
              </td>
            </tr>
            
            {/* Canadian Tax Display */}
            {showCanadianTax ? (
              <>
                {gstAmount > 0 && (
                  <tr>
                    <td colSpan={4} className="py-2 px-4 text-right">
                      GST (5%)
                    </td>
                    <td className="py-2 px-4 text-right">
                      CAD {gstAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
                {pstAmount > 0 && (
                  <tr>
                    <td colSpan={4} className="py-2 px-4 text-right">
                      PST ({taxConfig?.pstRate}%)
                    </td>
                    <td className="py-2 px-4 text-right">
                      CAD {pstAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
                {hstAmount > 0 && (
                  <tr>
                    <td colSpan={4} className="py-2 px-4 text-right">
                      HST ({taxConfig?.hstRate}%)
                    </td>
                    <td className="py-2 px-4 text-right">
                      CAD {hstAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
                {!invoiceData.isGstRegistered && totalTaxAmount === 0 && (
                  <tr>
                    <td colSpan={4} className="py-2 px-4 text-right text-sm">
                      No tax applied - not registered for GST/HST
                    </td>
                    <td className="py-2 px-4 text-right">
                      CAD 0.00
                    </td>
                  </tr>
                )}
                {invoiceData.isGstRegistered && totalTaxAmount === 0 && (
                  <tr>
                    <td colSpan={4} className="py-2 px-4 text-right text-sm">
                      Tax calculated at 0% (exempt items or error)
                    </td>
                    <td className="py-2 px-4 text-right">
                      CAD 0.00
                    </td>
                  </tr>
                )}
              </>
            ) : (
              /* Legacy Tax Display */
              <tr>
                <td colSpan={4} className="py-2 px-4 text-right">
                  Tax ({items[0]?.tax ?? 0}%)
                </td>
                <td className="py-2 px-4 text-right">
                  CAD {(totals.tax ?? 0).toFixed(2)}
                </td>
              </tr>
            )}
            
            <tr className="font-bold">
              <td colSpan={4} className="py-2 px-4 text-right">
                Total due
              </td>
              <td className="py-2 px-4 text-right">
                CAD {grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Additional Canadian Information */}
      {invoiceData.paymentMethods && invoiceData.paymentMethods.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-[#5F4B8B] font-semibold mb-1">Accepted Payment Methods:</p>
          <p className="text-sm text-gray-600">
            {invoiceData.paymentMethods.join(', ')}
          </p>
        </div>
      )}

      {invoiceData.notes && (
        <div className="mb-4">
          <p className="text-sm text-[#5F4B8B] font-semibold mb-1">Notes:</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {invoiceData.notes}
          </p>
        </div>
      )}

      {/* CRA Compliance Note */}
      {showCanadianTax && (
        <div className="text-xs text-gray-500 text-center mt-4 pt-4 border-t border-gray-200">
          This invoice meets Canada Revenue Agency (CRA) requirements
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------
// 3) The container that can toggle edit/preview (unchanged)
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
  return (
    <div className="relative">
      {!hideEditButton && (
        <button
          onClick={() => onTogglePreview?.()}
          className="absolute left-1/2 transform -translate-x-1/2 top-8 z-10 flex items-center gap-2 bg-buttonBg text-white px-6 py-2 rounded-full hover:bg-[#4a3a6d] transition-colors"
        >
          {isPreview ? (
            <>
              <Edit2 size={20} />
              <span>Edit</span>
            </>
          ) : (
            <>
              <Eye size={20} />
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