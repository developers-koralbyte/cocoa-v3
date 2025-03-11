import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Timestamp } from 'firebase/firestore';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  tax: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  companyLocation: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientLocation: string;
  bankName: string;
  bankAddress: string;
  accountName: string;
  iban: string;
  bic: string;
  companyLogo?: string;
  items: InvoiceItem[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

interface Invoice {
  id: string;
  vendorId: string;
  buyerId: string;
  status: string;
  invoiceData: InvoiceData;
  createdAt?: Timestamp;
}

/**
 * Generates a PDF from invoice data
 * @param invoice The invoice object containing all necessary data
 * @returns Promise that resolves to a Blob containing the PDF
 */
export const generateInvoicePdf = async (invoice: Invoice): Promise<Blob> => {
  // Create a new PDF document
  const doc = new jsPDF();
  const { invoiceData } = invoice;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Set document properties
  doc.setProperties({
    title: `Invoice ${invoiceData.invoiceNumber}`,
    subject: 'Invoice',
    author: invoiceData.companyName,
    creator: 'Cocoa Invoice System'
  });

  // Add company logo if available
  if (invoiceData.companyLogo) {
    try {
      // For base64 encoded images
      if (invoiceData.companyLogo.startsWith('data:image')) {
        doc.addImage(invoiceData.companyLogo, 'JPEG', pageWidth - 60, 10, 40, 40);
      }
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
      // Continue without the logo if there's an error
    }
  }

  // Add title
  doc.setFontSize(22);
  doc.setTextColor(95, 75, 139); // Purple color #5F4B8B
  doc.text('INVOICE', 20, 20);

  // Add invoice details
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0); // Black
  doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 20, 40);
  doc.text(`Invoice Date: ${invoiceData.invoiceDate}`, 20, 48);
  doc.text(`Due Date: ${invoiceData.dueDate}`, 20, 56);

  // Add company details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('From:', 20, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.companyName, 20, 78);
  doc.text(invoiceData.companyEmail, 20, 86);
  doc.text(invoiceData.companyAddress, 20, 94);
  doc.text(invoiceData.companyLocation, 20, 102);

  // Add client details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('To:', pageWidth - 90, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.recipientName, pageWidth - 90, 78);
  doc.text(invoiceData.recipientEmail, pageWidth - 90, 86);
  doc.text(invoiceData.recipientPhone || '', pageWidth - 90, 94);
  doc.text(invoiceData.recipientAddress, pageWidth - 90, 102);

  // Add invoice items table
  autoTable(doc, {
    startY: 115,
    head: [['Description', 'Quantity', 'Rate', 'Tax (%)', 'Amount']],
    body: invoiceData.items.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.rate.toFixed(2)}`,
      `${item.tax}%`,
      `$${(item.quantity * item.rate * (1 + item.tax / 100)).toFixed(2)}`
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [95, 75, 139], // Purple color #5F4B8B
    },
    footStyles: {
      fillColor: [240, 240, 240], // Light gray
      textColor: [0, 0, 0]
    },
    foot: [
      ['Subtotal', '', '', '', `$${invoiceData.totals.subtotal.toFixed(2)}`],
      ['Tax', '', '', '', `$${invoiceData.totals.tax.toFixed(2)}`],
      ['Total', '', '', '', `$${invoiceData.totals.total.toFixed(2)}`]
    ]
  });

  // Get Y position after the table - this needs to be adjusted since we're using the external autoTable
  const finalY = (doc as any).lastAutoTable?.finalY || 200;

  // Add payment instructions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Instructions:', 20, finalY + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  let paymentY = finalY + 23;
  doc.text(`Bank: ${invoiceData.bankName}`, 20, paymentY);
  paymentY += 7;
  doc.text(`Bank Address: ${invoiceData.bankAddress}`, 20, paymentY);
  paymentY += 7;
  doc.text(`Account Name: ${invoiceData.accountName}`, 20, paymentY);
  paymentY += 7;
  doc.text(`IBAN: ${invoiceData.iban}`, 20, paymentY);
  paymentY += 7;
  doc.text(`BIC: ${invoiceData.bic}`, 20, paymentY);

  // Add footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150); // Gray
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  
  // Generate PDF as blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

export default generateInvoicePdf;