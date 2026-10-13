import jsPDF from "jspdf";
import { SaleInvoice, StoreSetting } from "./types";

export function generateInvoicePDF(invoice: SaleInvoice, settings: StoreSetting) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header - Store Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(settings.storeName, 15, y);

  // Tagline
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  if (settings.tagline) {
    doc.text(settings.tagline, 15, y);
    y += 5;
  }

  // Store Address & Contact
  doc.setFontSize(8.5);
  doc.text(`${settings.address}, ${settings.city}, ${settings.state} - ${settings.pincode || ""}`, 15, y);
  y += 4;
  doc.text(`Phone: ${settings.phone} | Email: ${settings.email || "N/A"}`, 15, y);
  y += 4;
  if (settings.gstin) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`GSTIN: ${settings.gstin}`, 15, y);
  }

  // Invoice Title Box (Right Aligned)
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(pageWidth - 75, 12, 60, 26, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("TAX INVOICE", pageWidth - 70, 20);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 70, 26);
  doc.text(`Date: ${invoice.invoiceDate}`, pageWidth - 70, 31);
  doc.text(`Status: ${invoice.paymentStatus}`, pageWidth - 70, 35);

  // Horizontal divider
  y += 6;
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);

  // Customer / Bill To Section
  y += 7;
  doc.setFillColor(248, 250, 252);
  doc.rect(15, y, pageWidth - 30, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("BILL TO (CUSTOMER):", 18, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(invoice.customerName, 18, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${invoice.customerPhone || "N/A"}`, 18, y + 14);
  doc.text(`Address: ${invoice.customerAddress || "N/A"}`, 18, y + 18);

  if (invoice.customerGstin) {
    doc.setFont("helvetica", "bold");
    doc.text(`Customer GSTIN: ${invoice.customerGstin}`, pageWidth - 85, y + 10);
  }
  doc.text(`Payment Mode: ${invoice.paymentMethod}`, pageWidth - 85, y + 14);

  // Items Table Header
  y += 28;
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(15, y, pageWidth - 30, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("#", 18, y + 5.5);
  doc.text("Item / Brand Description", 26, y + 5.5);
  doc.text("Batch Ref & Date", 90, y + 5.5);
  doc.text("Qty / Unit", 132, y + 5.5);
  doc.text("Rate (₹)", 157, y + 5.5);
  doc.text("Total (₹)", 182, y + 5.5);

  // Items Table Rows
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);

  invoice.items.forEach((item, index) => {
    const rowY = y + index * 8;
    // Zebra stripe
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, rowY, pageWidth - 30, 8, "F");
    }

    doc.setFontSize(8.5);
    doc.text(String(index + 1), 18, rowY + 5.5);
    doc.text(`${item.brandName} - ${item.productName}`.slice(0, 36), 26, rowY + 5.5);
    doc.text(`${item.batchNumber} (${item.batchPurchaseDate})`.slice(0, 25), 90, rowY + 5.5);
    doc.text(`${item.quantity} ${item.unit}`, 132, rowY + 5.5);
    doc.text(`₹${item.sellingRate.toFixed(2)}`, 157, rowY + 5.5);
    doc.text(`₹${item.lineTotal.toFixed(2)}`, 182, rowY + 5.5);
  });

  const tableBottomY = y + invoice.items.length * 8;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, tableBottomY, pageWidth - 15, tableBottomY);

  // Totals Section
  let totalsY = tableBottomY + 6;

  // Notes on left
  if (invoice.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Notes / Remarks:", 15, totalsY);
    doc.setFont("helvetica", "italic");
    doc.text(invoice.notes, 15, totalsY + 4, { maxWidth: 95 });
  }

  // Bank Details on left
  if (settings.bankName) {
    const bankY = totalsY + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("Bank Details for Payment:", 15, bankY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Bank: ${settings.bankName}`, 15, bankY + 4);
    doc.text(`A/C No: ${settings.accountNumber || "N/A"} | IFSC: ${settings.ifscCode || "N/A"}`, 15, bankY + 8);
    if (settings.upiId) {
      doc.text(`UPI ID: ${settings.upiId}`, 15, bankY + 12);
    }
  }

  // Totals Box on right
  const rightBoxX = 125;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.text("Subtotal:", rightBoxX, totalsY);
  doc.text(`₹${invoice.subtotal.toFixed(2)}`, 182, totalsY);

  if (invoice.discount > 0) {
    totalsY += 5;
    doc.text("Discount:", rightBoxX, totalsY);
    doc.text(`- ₹${invoice.discount.toFixed(2)}`, 182, totalsY);
  }

  if (invoice.taxAmount > 0) {
    totalsY += 5;
    doc.text(`GST (${invoice.taxRate}%):`, rightBoxX, totalsY);
    doc.text(`+ ₹${invoice.taxAmount.toFixed(2)}`, 182, totalsY);
  }

  totalsY += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(rightBoxX - 2, totalsY - 4, 72, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Grand Total:", rightBoxX, totalsY + 1.5);
  doc.text(`₹${invoice.grandTotal.toFixed(2)}`, 182, totalsY + 1.5);

  totalsY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Paid Amount:", rightBoxX, totalsY);
  doc.text(`₹${invoice.paidAmount.toFixed(2)}`, 182, totalsY);

  totalsY += 5;
  doc.setFont("helvetica", "bold");
  if (invoice.balanceDue > 0) {
    doc.setTextColor(220, 38, 38); // red-600
    doc.text("Balance Due (Credit):", rightBoxX, totalsY);
    doc.text(`₹${invoice.balanceDue.toFixed(2)}`, 182, totalsY);
  } else {
    doc.setTextColor(22, 101, 52); // green-700
    doc.text("Balance Due:", rightBoxX, totalsY);
    doc.text("₹0.00 (PAID IN FULL)", 182, totalsY);
  }

  // Footer - Terms & Signature
  let footerY = 250;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, footerY, pageWidth - 15, footerY);

  footerY += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Terms & Conditions:", 15, footerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const termsText = settings.invoiceTerms || "1. Goods once sold will not be taken back.";
  doc.text(termsText, 15, footerY + 3.5, { maxWidth: 110 });

  // Signature box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`For ${settings.storeName}`, pageWidth - 65, footerY + 3.5);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.text("Authorized Signatory", pageWidth - 65, footerY + 22);

  // Save/Download PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
