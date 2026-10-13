"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Search,
  Download,
  Printer,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { SaleInvoice } from "@/lib/types";

interface InvoicesViewProps {
  invoices: SaleInvoice[];
  onViewInvoice: (invoice: SaleInvoice) => void;
  onNavigateToBilling: () => void;
}

export default function InvoicesView({
  invoices,
  onViewInvoice,
  onNavigateToBilling,
}: InvoicesViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceDate.includes(search);

    const matchesStatus = statusFilter === "ALL" || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = filteredInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalCollected = filteredInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalDue = filteredInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Billed</p>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            ₹{totalInvoiced.toLocaleString("en-IN")}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Collected Cash / UPI</p>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">
            ₹{totalCollected.toLocaleString("en-IN")}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Pending Credit (Receivables)</p>
          <h3 className="text-xl font-bold text-rose-600 mt-1">
            ₹{totalDue.toLocaleString("en-IN")}
          </h3>
        </div>
      </div>

      {/* Control Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice number, customer name, date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid in Full</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="CREDIT">Unpaid Credit</option>
          </select>
        </div>

        <button
          onClick={onNavigateToBilling}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          + Create New Bill
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Tax Invoices Ledger ({filteredInvoices.length} invoices)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Click View to Print or Download PDF</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <th className="py-3 px-3.5">Invoice #</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Customer & Items</th>
                <th className="py-3 px-3.5 text-right">Bill Total</th>
                <th className="py-3 px-3.5 text-right">Paid</th>
                <th className="py-3 px-3.5 text-right">Balance Due</th>
                <th className="py-3 px-3.5 text-right">Profit Earned</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">No Sales Invoices Yet</h4>
                      <p className="text-xs text-slate-500">
                        When you generate sales invoices for your customers, tax receipts with batch allocation and differential pricing will appear here.
                      </p>
                      <button
                        onClick={onNavigateToBilling}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        <span>+ Create First Sale Bill</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-bold font-mono text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-800">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500">
                        {inv.items.map((it) => `${it.brandName} (${it.quantity} ${it.unit})`).join(", ")}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                      ₹{inv.grandTotal.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3.5 text-right font-semibold text-emerald-700">
                      ₹{inv.paidAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold">
                      <span className={inv.balanceDue > 0 ? "text-rose-600" : "text-slate-400"}>
                        ₹{inv.balanceDue.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-emerald-600">
                      +₹{inv.totalProfit.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          inv.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : inv.paymentStatus === "PARTIALLY_PAID"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs inline-flex items-center space-x-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View / PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
