"use client";

import React from "react";
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { SaleInvoice, StoreSetting } from "@/lib/types";
import { generateInvoicePDF } from "@/lib/pdf-generator";

interface InvoiceModalProps {
  invoice: SaleInvoice | null;
  settings: StoreSetting | null;
  onClose: () => void;
}

export default function InvoiceModal({ invoice, settings, onClose }: InvoiceModalProps) {
  if (!invoice) return null;

  const currentSettings: StoreSetting = settings || {
    id: "default",
    storeName: "Sri Balaji Cements & Granite Mart",
    tagline: "Authorized Distributors for Ramco, Sagar, Ultratech & Kajaria",
    dealerType: "Wholesale Cement & Building Materials Dealer",
    ownerName: "M. Balaji Rao",
    gstin: "37AAACS1429B1Z8",
    phone: "+91 98480 23456",
    email: "balajimart.sales@gmail.com",
    address: "NH-16 Highway Junction, Autonagar",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    pincode: "520007",
    bankName: "State Bank of India",
    accountNumber: "389201948572",
    ifscCode: "SBIN0004128",
    upiId: "balajimart@sbi",
    invoicePrefix: "INV-2026-",
    invoiceTerms: "1. Goods once sold will not be returned.\n2. Interest @ 18% p.a. charged on overdue bills.",
    createdAt: "2026-10-01T00:00:00Z",
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateInvoicePDF(invoice, currentSettings);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 print:border-none print:shadow-none print:my-0">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
              {invoice.invoiceNumber}
            </span>
            <span className="text-sm font-semibold text-slate-200">Tax Invoice Preview</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 text-slate-800 text-xs space-y-6 printable-content">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentSettings.storeName}
              </h1>
              {currentSettings.tagline && (
                <p className="text-[11px] text-slate-500 font-medium">{currentSettings.tagline}</p>
              )}
              <div className="mt-2 text-slate-600 space-y-0.5 text-[11px]">
                <p>{currentSettings.address}, {currentSettings.city}, {currentSettings.state} - {currentSettings.pincode}</p>
                <p>Phone: {currentSettings.phone} | Email: {currentSettings.email}</p>
                {currentSettings.gstin && (
                  <p className="font-bold text-slate-900">GSTIN: {currentSettings.gstin}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-slate-100 border border-slate-200 px-3 py-1 rounded text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                TAX INVOICE
              </div>
              <div className="text-[11px] space-y-0.5 text-slate-600">
                <p>Invoice No: <strong className="text-slate-900 font-mono">{invoice.invoiceNumber}</strong></p>
                <p>Date: <strong className="text-slate-900">{invoice.invoiceDate}</strong></p>
                <p>Payment: <span className="font-semibold">{invoice.paymentStatus}</span> ({invoice.paymentMethod})</p>
              </div>
            </div>
          </div>

          {/* Customer / Bill To Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                BILL TO (BUYER)
              </span>
              <h3 className="text-sm font-bold text-slate-900">{invoice.customerName}</h3>
              <p className="text-slate-600 mt-0.5">{invoice.customerAddress || "Address not provided"}</p>
              <p className="text-slate-600">Phone: {invoice.customerPhone || "N/A"}</p>
              {invoice.customerGstin && (
                <p className="font-bold text-slate-900 mt-1">Customer GSTIN: {invoice.customerGstin}</p>
              )}
            </div>

            {invoice.notes && (
              <div className="sm:max-w-xs text-right sm:text-left border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-2 sm:pt-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Delivery Site / Notes
                </span>
                <p className="text-slate-700 italic text-[11px]">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Invoice Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Description of Goods</th>
                  <th className="py-2.5 px-3">Batch Ref & Date</th>
                  <th className="py-2.5 px-3 text-center">Qty / Unit</th>
                  <th className="py-2.5 px-3 text-right">Selling Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 1 ? "bg-slate-50/50" : "bg-white"}>
                    <td className="py-2.5 px-3 text-slate-500">{index + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.brandName} - {item.productName}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {item.batchNumber} ({item.batchPurchaseDate})
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                      ₹{item.sellingRate.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{item.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Bank Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Left: Bank details & Terms */}
            <div className="space-y-4">
              {currentSettings.bankName && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <span className="font-bold text-slate-800 block text-xs">Bank Details for RTGS/NEFT/UPI:</span>
                  <p>Bank Name: <span className="font-semibold">{currentSettings.bankName}</span></p>
                  <p>A/C Number: <span className="font-mono font-bold">{currentSettings.accountNumber}</span></p>
                  <p>IFSC Code: <span className="font-mono font-bold">{currentSettings.ifscCode}</span></p>
                  {currentSettings.upiId && (
                    <p>UPI ID: <span className="font-mono text-amber-700 font-bold">{currentSettings.upiId}</span></p>
                  )}
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Terms & Conditions:
                </span>
                <p className="text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">
                  {currentSettings.invoiceTerms || "1. Goods once sold will not be returned."}
                </p>
              </div>
            </div>

            {/* Right: Calculations */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-₹{invoice.discount.toFixed(2)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>GST ({invoice.taxRate}%):</span>
                  <span>+₹{invoice.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-base font-black">₹{invoice.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                <span>Amount Paid:</span>
                <span>₹{invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Balance Due:</span>
                <span
                  className={`font-bold ${
                    invoice.balanceDue > 0 ? "text-rose-600 font-black" : "text-emerald-700"
                  }`}
                >
                  {invoice.balanceDue > 0 ? `₹${invoice.balanceDue.toFixed(2)}` : "₹0.00 (PAID)"}
                </span>
              </div>
            </div>
          </div>

          {/* Authorized Signature Footer */}
          <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-xs">
            <div className="text-[11px] text-slate-400">
              Generated by BuildCraft CRM SaaS System
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">For {currentSettings.storeName}</p>
              <div className="h-12" />
              <p className="text-[11px] text-slate-500 border-t border-slate-300 pt-1">
                Authorized Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
