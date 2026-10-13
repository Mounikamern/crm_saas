"use client";

import React from "react";
import {
  IndianRupee,
  TrendingUp,
  PackageCheck,
  AlertCircle,
  ArrowUpRight,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  FileText,
} from "lucide-react";
import { DashboardStats, Batch, SaleInvoice } from "@/lib/types";

interface DashboardViewProps {
  stats: DashboardStats | null;
  batches: Batch[];
  onNavigateToTab: (tab: string) => void;
  onViewInvoice: (invoice: SaleInvoice) => void;
  onOpenNewBatchModal: () => void;
}

export default function DashboardView({
  stats,
  batches,
  onNavigateToTab,
  onViewInvoice,
  onOpenNewBatchModal,
}: DashboardViewProps) {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 mx-auto" />
          <p className="text-sm font-medium">Loading store dashboard metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Sales Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              From {stats.recentInvoices.length} sales invoices
            </p>
          </div>
        </div>

        {/* Realized Profit */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Profit Earned</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-amber-700 tracking-tight">
              ₹{stats.totalProfit.toLocaleString("en-IN")}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Gross Margin: <span className="font-semibold text-slate-800">{stats.grossMarginPercent}%</span>
            </p>
          </div>
        </div>

        {/* Inventory Stock Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stock Valuation (Cost)</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{stats.totalStockValue.toLocaleString("en-IN")}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Across <span className="font-semibold text-slate-800">{stats.totalActiveBatches} active batches</span>
            </p>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Credit Outstanding</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-rose-600 tracking-tight">
              ₹{stats.totalReceivables.toLocaleString("en-IN")}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Customer pending dues to collect
            </p>
          </div>
        </div>
      </div>

      {/* SPECIAL HIGHLIGHT: Batch-Wise Tracking Showcase */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Layers className="w-48 h-48 text-amber-400" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Batch-Wise Stock & Profit Tracking Engine</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Purchase Batch Breakdown (Ramco & Sagar Cements)
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Full transparency into bags purchased, sold, remaining stock, and exact profit earned per date.
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab("batch-analytics")}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all self-start md:self-auto"
            >
              <span>View Full Batch Report</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick cards for the 4 key batches */}
          {batches.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-slate-800/40 rounded-xl border border-slate-700/60 p-6 mt-4">
              <p className="font-semibold text-slate-200 text-sm">No stock batches inwarded yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Inward your first stock consignment to track units sold and profit margins.</p>
              <button
                onClick={onOpenNewBatchModal}
                className="mt-3 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                + Inward First Stock Batch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              {batches.slice(0, 4).map((b) => {
                const soldPct = Math.round((b.soldQuantity / b.initialQuantity) * 100);
                return (
                  <div
                    key={b.id}
                    className="bg-slate-800/80 backdrop-blur-xs rounded-xl p-4 border border-slate-700 hover:border-amber-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span className="font-semibold text-white">{b.brandName}</span>
                      <span className="bg-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300">
                        {b.purchaseDate}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mb-2">{b.batchNumber}</div>

                    <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700/50 pt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cost Price:</span>
                        <span className="font-bold text-white">₹{b.purchaseRate} / {b.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Bought:</span>
                        <span>{b.initialQuantity} {b.unit}</span>
                      </div>
                      <div className="flex justify-between text-emerald-300">
                        <span>Bags Sold:</span>
                        <span className="font-semibold">{b.soldQuantity} {b.unit}</span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span>Stock Left:</span>
                        <span className="font-bold">{b.availableQuantity} {b.unit}</span>
                      </div>
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, soldPct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span>{soldPct}% Sold</span>
                        <span className="font-semibold text-emerald-400">
                          Profit: +₹{b.totalProfitRealized.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Brand-wise breakdown & Recent Sales Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand-Wise Inventory Valuation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Brand-Wise Stock Summary</h4>
              <p className="text-xs text-slate-500">Inventory balance across brands</p>
            </div>
            <button
              onClick={() => onNavigateToTab("batches")}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {stats.brandSummaries.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No inwarded brands in stock yet.
              </div>
            ) : (
              stats.brandSummaries.map((brand, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{brand.brandName}</h5>
                    <p className="text-[11px] text-slate-500">{brand.categoryName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {brand.totalStockBags} <span className="text-[10px] font-normal text-slate-500">{brand.unit}</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold">
                      +₹{brand.totalProfit.toLocaleString("en-IN")} profit
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={onOpenNewBatchModal}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1"
            >
              <span>+ Inward Stock from Supplier</span>
            </button>
          </div>
        </div>

        {/* Recent Invoices Table (Right 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Recent Customer Sales Invoices</h4>
              <p className="text-xs text-slate-500">Invoices generated with custom rates & batch allocation</p>
            </div>
            <button
              onClick={() => onNavigateToTab("invoices")}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              View All Invoices ({stats.recentInvoices.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                  <th className="py-2.5 px-3 font-semibold">Invoice #</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Bill Total</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Profit</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No customer invoices billed yet. Go to Billing to generate your first invoice.
                    </td>
                  </tr>
                ) : (
                  stats.recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold font-mono text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {inv.invoiceDate}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium max-w-[150px] truncate">
                        {inv.customerName}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 text-right">
                        ₹{inv.grandTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600 text-right">
                        +₹{inv.totalProfit.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-center">
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
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
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
    </div>
  );
}
