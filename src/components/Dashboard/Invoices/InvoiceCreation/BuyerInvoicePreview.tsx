import React, { useEffect, useState } from 'react';
import generateInvoicePdf from './InvoicePdfGenerator'; 
// ^ Update this import path to wherever InvoicePdfGenerator is located in your project

// Updated interfaces to match Canadian buyer invoice data structure
interface BuyerInvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number; // Keep 'price' for buyer invoices
  unitPrice?: number; // Canadian field
  tax: number;
}

interface BuyerInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  companyLocation: string;
  
  // Canadian business fields
  businessCity?: string;
  businessProvince?: string;
  businessPostalCode?: string;
  businessPhone?: string;
  gstNumber?: string;
  isGstRegistered?: boolean;
  
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientLocation: string;
  
  // Canadian client fields
  clientCity?: string;
  clientProvince?: string;
  clientPostalCode?: string;
  
  // Payment info
  paymentTerms?: string;
  paymentMethods?: string[];
  notes?: string;
  
  bankName: string;
  bankAddress: string;
  accountName: string;
  iban: string;
  bic: string;
  companyLogo?: string;
  items: BuyerInvoiceItem[];
  totals: {
    subtotal: number;
    tax: number;
    // Canadian tax fields
    gst?: number;
    pst?: number;
    hst?: number;
    totalTax?: number;
    total: number;
  };
}

interface BuyerInvoice {
  id: string;
  vendorId: string;
  buyerId: string;
  status: string;
  invoiceData: BuyerInvoiceData;
}

interface BuyerInvoicePreviewProps {
  // The invoice object to preview
  invoice: BuyerInvoice;

  // Optional: a callback if you want to handle "close" events in a modal, etc.
  onClose?: () => void;
}

const BuyerInvoicePreview: React.FC<BuyerInvoicePreviewProps> = ({ invoice, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth > 640 && window.innerWidth <= 1024
  );

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 640);
      setIsTablet(width > 640 && width <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const createPdfPreview = async () => {
      try {
        // Transform buyer invoice data to match what the PDF generator expects
        // Handle both legacy and Canadian invoice formats
        const transformedInvoice = {
          ...invoice,
          invoiceData: {
            ...invoice.invoiceData,
            items: invoice.invoiceData.items.map(item => ({
              ...item,
              // Ensure we have the right price field for PDF generator
              price: item.unitPrice || item.price || 0,
              unitPrice: item.unitPrice || item.price || 0,
              // Handle legacy 'rate' field if it exists
              ...(item as any).rate && { price: (item as any).rate }
            }))
          }
        };

        // Generate a PDF blob from the transformed invoice data
        const pdfBlob = await generateInvoicePdf(transformedInvoice);

        // Convert the blob to a URL for display in an iframe
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
      } catch (err) {
        console.error('Error generating buyer invoice PDF:', err);
        setError('Failed to generate PDF preview.');
      } finally {
        setIsLoading(false);
      }
    };

    createPdfPreview();

    // Cleanup: Revoke the object URL when unmounting
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice]);

  if (isLoading) {
    return (
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center ${isMobile ? 'p-4' : 'p-8'}`}>
        <div className={`animate-spin rounded-full ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} border-b-2 border-[#8B85C1] ${isMobile ? 'mb-2' : 'mr-3'}`}></div>
        <p className={`${isMobile ? 'text-sm text-center' : 'text-base'}`}>
          Generating Canadian invoice PDF preview...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isMobile ? 'p-4' : 'p-8'} text-red-500`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <h3 className={`font-semibold mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
            PDF Generation Error
          </h3>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} mb-2`}>
            {error}
          </p>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-red-600`}>
            This may be due to missing Canadian tax information or PDF generator compatibility.
          </p>
          
          {/* Retry button for mobile */}
          {isMobile && (
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className={`flex items-center justify-center ${isMobile ? 'p-4' : 'p-8'}`}>
        <div className="text-center">
          <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-base'} mb-3`}>
            Unable to generate PDF preview.
          </p>
          {isMobile && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header with controls - Responsive */}
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'} ${isMobile ? 'p-3' : 'p-4'} bg-gray-50 border-b`}>
        {/* Canadian invoice indicator */}
        {invoice.invoiceData.isGstRegistered && (
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="text-sm">🇨🇦</span>
              <span className={isMobile ? 'hidden xs:inline' : ''}>CRA Compliant</span>
            </div>
            {!isMobile && (
              <span className="text-xs text-gray-600">
                Invoice #{invoice.invoiceData.invoiceNumber}
              </span>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Download button - responsive */}
          <button
            onClick={() => {
              if (pdfUrl) {
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `invoice-${invoice.invoiceData.invoiceNumber}.pdf`;
                link.click();
              }
            }}
            className={`bg-[#8B85C1] text-white ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'} rounded-lg hover:bg-[#7A6FB0] transition-colors flex items-center gap-1 sm:gap-2`}
          >
            <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className={isMobile ? 'hidden xs:inline' : ''}>Download</span>
          </button>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className={`bg-gray-200 text-gray-700 ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'} rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1 sm:gap-2`}
            >
              <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className={isMobile ? 'hidden xs:inline' : ''}>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewer - Responsive */}
      <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <iframe
            title="Canadian Invoice PDF Preview"
            src={pdfUrl}
            className="w-full"
            style={{ 
              height: isMobile ? '60vh' : isTablet ? '70vh' : '80vh',
              border: 'none',
              minHeight: '400px'
            }}
          />
        </div>
      </div>
      
      {/* Canadian tax summary - Responsive */}
      {invoice.invoiceData.isGstRegistered && invoice.invoiceData.totals.totalTax && (
        <div className={`${isMobile ? 'mx-2 mb-2' : 'mx-4 mb-4'}`}>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 sm:p-4">
            <h4 className={`font-semibold text-blue-800 mb-2 sm:mb-3 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Canadian Tax Summary
            </h4>
            
            {/* Mobile: Stack layout, Desktop: Grid layout */}
            <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-2 md:grid-cols-4 gap-4'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <div className={`${isMobile ? 'flex justify-between items-center py-2 border-b border-blue-200' : ''}`}>
                <span className="text-blue-600">Subtotal:</span>
                <div className={`font-semibold ${isMobile ? 'text-right' : ''}`}>
                  ${invoice.invoiceData.totals.subtotal.toFixed(2)} CAD
                </div>
              </div>
              
              {invoice.invoiceData.totals.gst && invoice.invoiceData.totals.gst > 0 && (
                <div className={`${isMobile ? 'flex justify-between items-center py-2 border-b border-blue-200' : ''}`}>
                  <span className="text-blue-600">GST (5%):</span>
                  <div className={`font-semibold ${isMobile ? 'text-right' : ''}`}>
                    ${invoice.invoiceData.totals.gst.toFixed(2)} CAD
                  </div>
                </div>
              )}
              
              {invoice.invoiceData.totals.pst && invoice.invoiceData.totals.pst > 0 && (
                <div className={`${isMobile ? 'flex justify-between items-center py-2 border-b border-blue-200' : ''}`}>
                  <span className="text-blue-600">PST:</span>
                  <div className={`font-semibold ${isMobile ? 'text-right' : ''}`}>
                    ${invoice.invoiceData.totals.pst.toFixed(2)} CAD
                  </div>
                </div>
              )}
              
              {invoice.invoiceData.totals.hst && invoice.invoiceData.totals.hst > 0 && (
                <div className={`${isMobile ? 'flex justify-between items-center py-2 border-b border-blue-200' : ''}`}>
                  <span className="text-blue-600">HST:</span>
                  <div className={`font-semibold ${isMobile ? 'text-right' : ''}`}>
                    ${invoice.invoiceData.totals.hst.toFixed(2)} CAD
                  </div>
                </div>
              )}
              
              <div className={`${isMobile ? 'flex justify-between items-center py-2 font-bold bg-blue-100 px-3 rounded' : ''}`}>
                <span className="text-blue-600">Total:</span>
                <div className={`font-bold ${isMobile ? 'text-lg text-right' : 'text-lg'}`}>
                  ${invoice.invoiceData.totals.total.toFixed(2)} CAD
                </div>
              </div>
            </div>
            
            {/* Additional info - Responsive */}
            {invoice.invoiceData.businessProvince && (
              <div className={`mt-3 ${isMobile ? 'text-xs' : 'text-sm'} text-blue-600 ${isMobile ? 'text-center' : ''}`}>
                <div className={`${isMobile ? 'space-y-1' : 'flex items-center gap-4'}`}>
                  <span>Province: {invoice.invoiceData.businessProvince}</span>
                  {invoice.invoiceData.gstNumber && (
                    <span className={isMobile ? 'block' : ''}>
                      {!isMobile && '•'} GST/HST #: {invoice.invoiceData.gstNumber}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile-specific invoice details */}
      {isMobile && (
        <div className="mx-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <h5 className="font-semibold text-gray-800 text-sm mb-2">Invoice Details</h5>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Invoice #:</span>
                <span className="font-medium">{invoice.invoiceData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">{invoice.invoiceData.invoiceDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span className="font-medium">{invoice.invoiceData.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${
                  invoice.status === 'Paid' 
                    ? 'bg-green-100 text-green-800'
                    : invoice.status === 'Unpaid'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerInvoicePreview;