// utils/invoiceDownloadService.ts
import { generateInvoicePdf } from '../components/Dashboard/Invoices/InvoiceCreation/InvoicePdfGenerator';

/**
 * Downloads a single invoice as a PDF
 * @param invoice The invoice data
 * @param filename Optional custom filename
 */
export const downloadInvoice = async (invoice: any, filename?: string) => {
  try {
    // Generate the PDF blob
    const pdfBlob = await generateInvoicePdf(invoice);
    
    // Create a download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    
    // Set the filename
    const defaultName = invoice.invoiceData?.invoiceNumber || `invoice-${Date.now()}`;
    link.download = `${filename || defaultName}.pdf`;
    link.href = url;
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    return true;
  } catch (error) {
    console.error('Error downloading invoice:', error);
    return false;
  }
};

/**
 * Downloads multiple invoices as PDFs
 * @param invoices Array of invoice data objects
 * @param prefix Optional prefix for filenames
 */
export const downloadMultipleInvoices = async (invoices: any[], prefix = 'invoice') => {
  if (!invoices || invoices.length === 0) {
    console.warn('No invoices to download');
    return false;
  }
  
  let successCount = 0;
  
  // Process each invoice with a small delay between downloads
  for (let i = 0; i < invoices.length; i++) {
    const invoice = invoices[i];
    const filename = `${prefix}-${invoice.invoiceData?.invoiceNumber || i+1}`;
    
    // Add a small delay between downloads to prevent browser throttling
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const success = await downloadInvoice(invoice, filename);
    if (success) successCount++;
  }
  
  return successCount === invoices.length;
};

export default {
  downloadInvoice,
  downloadMultipleInvoices
};
