"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  IndianRupee,
  ShoppingBag,
  Eye,
} from "lucide-react";
import { Customer, SaleInvoice } from "@/lib/types";

interface CustomerDetailModalProps {
  customer: Customer | null;
  invoices: SaleInvoice[];
  onClose: () => void;
  onViewInvoice: (invoice: SaleInvoice) => void;
  onNavigateToBilling: (customerId: string) => void;
  onCustomerUpdated: (customer: Customer) => void;
}

export default function CustomerDetailModal({
  customer,
  invoices,
  onClose,
  onViewInvoice,
  onNavigateToBilling,
  onCustomerUpdated,
}: CustomerDetailModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE">("UPI");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!customer) return null;

  // Find all invoices for this customer
  const customerInvoices = invoices.filter((i) => i.customerId === customer.id);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (paymentAmount <= 0) {
      setErrorMsg("Please enter a valid payment amount greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod,
          notes: paymentNotes,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to record payment");
      }

      setSuccessMsg(`Successfully recorded payment of ₹${paymentAmount.toLocaleString("en-IN")}!`);
      setPaymentAmount(0);
      setPaymentNotes("");
      onCustomerUpdated(data.customer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error recording payment";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>{customer.name}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-normal">
                  {customer.customerType}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Customer 360 & Financial Ledger</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Financial Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Lifetime Billed</span>
              <p className="text-base font-bold text-slate-900 mt-1">
                ₹{customer.totalBilled.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Paid</span>
              <p className="text-base font-bold text-emerald-600 mt-1">
                ₹{customer.totalPaid.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200">
              <span className="text-[10px] text-rose-700 font-semibold uppercase">Pending Due (Credit)</span>
              <p className="text-base font-bold text-rose-700 mt-1">
                ₹{customer.creditBalance.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Contact Details Bar */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block">Phone</span>
              <span className="font-semibold text-slate-800 font-mono">{customer.phone || "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Location / City</span>
              <span className="font-semibold text-slate-800">{customer.city || "Local"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">GSTIN</span>
              <span className="font-semibold text-slate-800 font-mono">{customer.gstin || "Unregistered / Consumer"}</span>
            </div>
            {customer.address && (
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] text-slate-400 block">Delivery Site Address</span>
                <span className="text-slate-700">{customer.address}</span>
              </div>
            )}
          </div>

          {/* Record Payment Section (if customer has outstanding balance) */}
          {customer.creditBalance > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Record Customer Payment / Credit Settlement</span>
                </div>
                <span className="text-[11px] text-amber-800 font-semibold">
                  Due: ₹{customer.creditBalance.toLocaleString("en-IN")}
                </span>
              </div>

              {successMsg && (
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-md text-xs border border-emerald-200">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-2 bg-rose-50 text-rose-800 rounded-md text-xs border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max={customer.creditBalance}
                    placeholder="Enter amount"
                    value={paymentAmount || ""}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Receipt Note</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR / Cash receipt"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || paymentAmount <= 0}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Record Payment"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Customer's Invoices List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Sales Invoices History ({customerInvoices.length})</span>
              </h4>

              <button
                onClick={() => {
                  onClose();
                  onNavigateToBilling(customer.id);
                }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ New Bill for this Customer</span>
              </button>
            </div>

            {customerInvoices.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No invoices recorded for this customer yet.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Items Purchased</th>
                      <th className="py-2.5 px-3 text-right">Bill Total</th>
                      <th className="py-2.5 px-3 text-right">Paid</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 font-bold font-mono text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{inv.invoiceDate}</td>
                        <td className="py-2 px-3 text-slate-700">
                          {inv.items.map((it) => `${it.brandName} (${it.quantity} ${it.unit} @ ₹${it.sellingRate})`).join(", ")}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          ₹{inv.grandTotal.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                          ₹{inv.paidAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 px-3 text-right font-bold">
                          <span className={inv.balanceDue > 0 ? "text-rose-600" : "text-slate-400"}>
                            ₹{inv.balanceDue.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => {
                              onClose();
                              onViewInvoice(inv);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
