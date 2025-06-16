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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B85C1] mr-3"></div>
        <p>Generating Canadian invoice PDF preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">PDF Generation Error</h3>
          <p>{error}</p>
          <p className="text-sm mt-2 text-red-600">
            This may be due to missing Canadian tax information or PDF generator compatibility.
          </p>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Unable to generate PDF preview.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Optional close button if you're using a modal */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-200 px-4 py-1 rounded-lg hover:bg-gray-300 z-10"
        >
          Close
        </button>
      )}

      {/* Canadian invoice indicator */}
      {invoice.invoiceData.isGstRegistered && (
        <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium z-10">
          🇨🇦 CRA Compliant
        </div>
      )}

      <iframe
        title="Canadian Invoice PDF Preview"
        src={pdfUrl}
        style={{ width: '100%', height: '80vh', border: 'none' }}
      />
      
      {/* Optional Canadian tax summary below iframe */}
      {invoice.invoiceData.isGstRegistered && invoice.invoiceData.totals.totalTax && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Canadian Tax Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Subtotal:</span>
              <div className="font-semibold">${invoice.invoiceData.totals.subtotal.toFixed(2)} CAD</div>
            </div>
            
            {invoice.invoiceData.totals.gst && invoice.invoiceData.totals.gst > 0 && (
              <div>
                <span className="text-blue-600">GST (5%):</span>
                <div className="font-semibold">${invoice.invoiceData.totals.gst.toFixed(2)} CAD</div>
              </div>
            )}
            
            {invoice.invoiceData.totals.pst && invoice.invoiceData.totals.pst > 0 && (
              <div>
                <span className="text-blue-600">PST:</span>
                <div className="font-semibold">${invoice.invoiceData.totals.pst.toFixed(2)} CAD</div>
              </div>
            )}
            
            {invoice.invoiceData.totals.hst && invoice.invoiceData.totals.hst > 0 && (
              <div>
                <span className="text-blue-600">HST:</span>
                <div className="font-semibold">${invoice.invoiceData.totals.hst.toFixed(2)} CAD</div>
              </div>
            )}
            
            <div>
              <span className="text-blue-600">Total:</span>
              <div className="font-bold text-lg">${invoice.invoiceData.totals.total.toFixed(2)} CAD</div>
            </div>
          </div>
          
          {invoice.invoiceData.businessProvince && (
            <div className="mt-2 text-xs text-blue-600">
              Province: {invoice.invoiceData.businessProvince}
              {invoice.invoiceData.gstNumber && ` • GST/HST #: ${invoice.invoiceData.gstNumber}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyerInvoicePreview;