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
 * Generates a PDF from invoice data that matches the styling of InvoicePreview
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
  
  // -- HEADER SECTION --
  const margin = 20;
  
  // Add title
  doc.setFontSize(35);
  doc.setTextColor(95, 75, 139); // Purple: #5F4B8B
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice', margin, margin + 10);

  // Add invoice details
  doc.setFontSize(16);
  doc.setTextColor(95, 75, 139);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No : ${invoiceData.invoiceNumber}`, margin, margin + 25);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Date : ${invoiceData.invoiceDate}`, margin, margin + 35);
  doc.text(`Due Date : ${invoiceData.dueDate}`, margin, margin + 45);

  // Add company logo if available
  if (invoiceData.companyLogo) {
    try {
      // For base64 encoded images
      if (invoiceData.companyLogo.startsWith('data:image')) {
        doc.addImage(invoiceData.companyLogo, 'JPEG', pageWidth - 70, margin, 50, 50);
      }
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
      // Continue without the logo if there's an error
    }
  } else {
    // Add a placeholder circle if no logo
    doc.setFillColor(95, 75, 139);
    doc.saveGraphicsState();
    doc.setFillColor(200, 195, 220); // Lighter purple to simulate opacity
    doc.circle(pageWidth - 45, margin + 25, 15, 'F');
    doc.restoreGraphicsState();
  }

  // -- COMPANY AND CLIENT INFORMATION --
  let currentY = margin + 70;
  
  // Company Info (Left Column)
  doc.setFontSize(16);
  doc.setTextColor(95, 75, 139);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.companyName, margin, currentY);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.companyEmail || '', margin, currentY + 10);
  doc.text(invoiceData.companyAddress || '', margin, currentY + 20);
  doc.text(invoiceData.companyLocation || '', margin, currentY + 30);

  // Client Info (Right Column)
  doc.setFontSize(16);
  doc.setTextColor(95, 75, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice to', pageWidth - margin - 5, currentY, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.recipientName || '', pageWidth - margin, currentY + 10, { align: 'right' });
  doc.text(invoiceData.recipientPhone || '', pageWidth - margin, currentY + 20, { align: 'right' });
  doc.text(invoiceData.recipientEmail || '', pageWidth - margin, currentY + 30, { align: 'right' });
  doc.text(invoiceData.recipientAddress || '', pageWidth - margin, currentY + 40, { align: 'right' });

  // -- AMOUNT DUE SECTION --
  currentY += 60;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(95, 75, 139);
  doc.text(`CAD ${invoiceData.totals.total.toFixed(2)} due on ${invoiceData.dueDate}`, margin, currentY);

  // -- ITEMS TABLE --
  currentY += 15;
  // Calculate available width for items table
  const availableWidthItems = pageWidth - margin * 2;

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Qty', 'Rate', 'Tax', 'Amount']],
    body: invoiceData.items.map(item => [
      item.description,
      item.quantity.toString(),
      `CAD ${item.rate.toFixed(2)}`,
      `${item.tax}%`,
      `CAD ${(item.quantity * item.rate).toFixed(2)}`
    ]),
    foot: [
      ['Total ex. Tax', '', '', '', `CAD ${invoiceData.totals.subtotal.toFixed(2)}`],
      [`Tax, Smwhere (${invoiceData.items[0]?.tax || 0}%)`, '', '', '', `CAD ${invoiceData.totals.tax.toFixed(2)}`],
      ['Total due', '', '', '', `CAD ${invoiceData.totals.total.toFixed(2)}`]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [243, 240, 250],
      textColor: [95, 75, 139],
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fillColor: [243, 240, 250],
    },
    footStyles: {
      fillColor: [243, 240, 250],
      textColor: [95, 75, 139],
      fontStyle: 'bold',
    },
    // Make the Description column larger (50% of available width):
    columnStyles: {
      0: { cellWidth: availableWidthItems * 0.5, halign: 'left' },    // Description (50%)
      1: { cellWidth: availableWidthItems * 0.1, halign: 'center' },  // Qty (10%)
      2: { cellWidth: availableWidthItems * 0.13, halign: 'center' }, // Rate (13%)
      3: { cellWidth: availableWidthItems * 0.1, halign: 'center' },  // Tax (10%)
      4: { cellWidth: availableWidthItems * 0.17, halign: 'right' },  // Amount (17%)
    },
    alternateRowStyles: {
      fillColor: [243, 240, 250],
    },
    tableWidth: availableWidthItems,
    margin: { left: margin }
  });

  // Get Y position after the table
  // @ts-ignore - lastAutoTable is added by the autoTable plugin
  const finalY = doc.lastAutoTable?.finalY || 200;

  // -- PAYMENT INSTRUCTIONS SECTION REMOVED --

  // Generate PDF as blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

export default generateInvoicePdf;
