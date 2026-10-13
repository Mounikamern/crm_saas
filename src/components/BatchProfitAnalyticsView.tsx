"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle,
} from "lucide-react";
import { BatchProfitSummary, SaleInvoice } from "@/lib/types";

interface BatchProfitAnalyticsViewProps {
  batchSummaries: BatchProfitSummary[];
  invoices: SaleInvoice[];
}

export default function BatchProfitAnalyticsView({
  batchSummaries,
  invoices,
}: BatchProfitAnalyticsViewProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batchSummaries[0]?.batchId || ""
  );

  const selectedBatch = batchSummaries.find((b) => b.batchId === selectedBatchId) || batchSummaries[0];

  // Find all invoice items sold specifically from the selected batch
  const batchSalesLines = invoices.flatMap((inv) =>
    inv.items
      .filter((item) => item.batchId === selectedBatch?.batchId)
      .map((item) => ({
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        customerName: inv.customerName,
        customerType: inv.notes?.includes("Contractor") ? "Contractor" : "Retail Customer",
        quantity: item.quantity,
        unit: item.unit,
        batchCostRate: item.batchCostRate,
        sellingRate: item.sellingRate,
        lineTotal: item.lineTotal,
        lineCost: item.lineCost,
        lineProfit: item.lineProfit,
      }))
  );

  // Group batches by brand to show side-by-side date comparison (01/10/2026 vs 10/10/2026)
  const ramcoBatches = batchSummaries.filter((b) => b.brandName.includes("Ramco"));
  const sagarBatches = batchSummaries.filter((b) => b.brandName.includes("Sagar"));

  if (batchSummaries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs my-8 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Batch Profit Records Yet</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          For a new store, real-time batch profit analysis activates as soon as you inward your first consignment and bill your first customer.
          You will be able to track exact bags sold, stock remaining, and realized margins per purchase batch.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the user's requirement */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-xl mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Batch-Wise Stock Depletion & Profit Tracking
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-4xl leading-relaxed">
              Whenever you purchase consignments at different rates on different dates (e.g. Ramco Cement on 01/10/2026 @ ₹230 and on 10/10/2026 @ ₹250), this report calculates <strong>how many bags were sold from each specific batch</strong>, <strong>how much stock is left</strong>, and the <strong>exact gross profit earned</strong> accounting for differential selling rates.
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison for Ramco & Sagar Batches */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>Ramco Cement: 01/10/2026 Batch vs 10/10/2026 Batch</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ramcoBatches.map((b) => (
            <div
              key={b.batchId}
              onClick={() => setSelectedBatchId(b.batchId)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                selectedBatch?.batchId === b.batchId
                  ? "bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/20 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-900 font-mono">{b.batchNumber}</span>
                  <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Purchase Date: <strong>{b.purchaseDate}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Cost Rate</span>
                  <div className="text-sm font-bold text-slate-900">₹{b.purchaseRate} / {b.unit}</div>
                </div>
              </div>

              {/* 3 Core Questions Answers */}
              <div className="grid grid-cols-3 gap-2 py-3 text-center border-b border-slate-100">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[11px] text-slate-500">Bags Sold</div>
                  <div className="text-sm font-bold text-emerald-600">{b.soldQuantity} {b.unit}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[11px] text-slate-500">Stock Left</div>
                  <div className="text-sm font-bold text-blue-600">{b.availableQuantity} {b.unit}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[11px] text-slate-500">Profit Earned</div>
                  <div className="text-sm font-bold text-amber-700">+₹{b.netProfit.toLocaleString("en-IN")}</div>
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center text-xs text-slate-500">
                <span>Initial: {b.initialQuantity} {b.unit} (₹{b.totalPurchaseCost.toLocaleString("en-IN")})</span>
                <span className="font-semibold text-slate-700">Margin: {b.profitMarginPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sagar Cement Batches Comparison */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Sagar Cement: 01/10/2026 Batch vs 10/10/2026 Batch</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sagarBatches.map((b) => (
            <div
              key={b.batchId}
              onClick={() => setSelectedBatchId(b.batchId)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                selectedBatch?.batchId === b.batchId
                  ? "bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/20 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-900 font-mono">{b.batchNumber}</span>
                  <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Purchase Date: <strong>{b.purchaseDate}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Cost Rate</span>
                  <div className="text-sm font-bold text-slate-900">₹{b.purchaseRate} / {b.unit}</div>
                </div>
              </div>

              {/* 3 Core Questions Answers */}
              <div className="grid grid-cols-3 gap-2 py-3 text-center border-b border-slate-100">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[11px] text-slate-500">Bags Sold</div>
                  <div className="text-sm font-bold text-emerald-600">{b.soldQuantity} {b.unit}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[11px] text-slate-500">Stock Left</div>
                  <div className="text-sm font-bold text-blue-600">{b.availableQuantity} {b.unit}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[11px] text-slate-500">Profit Earned</div>
                  <div className="text-sm font-bold text-amber-700">+₹{b.netProfit.toLocaleString("en-IN")}</div>
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center text-xs text-slate-500">
                <span>Initial: {b.initialQuantity} {b.unit} (₹{b.totalPurchaseCost.toLocaleString("en-IN")})</span>
                <span className="font-semibold text-slate-700">Margin: {b.profitMarginPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Batch Deep Dive Details */}
      {selectedBatch && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Active Batch Focus
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedBatch.brandName} - {selectedBatch.productName} ({selectedBatch.batchNumber})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Purchased on <strong>{selectedBatch.purchaseDate}</strong> @ <strong>₹{selectedBatch.purchaseRate}/{selectedBatch.unit}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg">
                Initial: {selectedBatch.initialQuantity} {selectedBatch.unit}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg">
                Sold: {selectedBatch.soldQuantity} {selectedBatch.unit}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg">
                Stock Left: {selectedBatch.availableQuantity} {selectedBatch.unit}
              </span>
            </div>
          </div>

          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Total Consignment Cost</span>
              <p className="text-base font-bold text-slate-900 mt-1">₹{selectedBatch.totalPurchaseCost.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{selectedBatch.initialQuantity} x ₹{selectedBatch.purchaseRate}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Sales Revenue Realized</span>
              <p className="text-base font-bold text-slate-900 mt-1">₹{selectedBatch.totalRevenue.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Across {batchSalesLines.length} customer sales</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Cost of Bags Sold</span>
              <p className="text-base font-bold text-slate-900 mt-1">₹{selectedBatch.totalCostOfSold.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{selectedBatch.soldQuantity} x ₹{selectedBatch.purchaseRate}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[11px] text-amber-800 font-bold">Batch Net Profit Earned</span>
              <p className="text-base font-black text-amber-700 mt-1">+₹{selectedBatch.netProfit.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Margin: {selectedBatch.profitMarginPercent}%</p>
            </div>
          </div>

          {/* Sales Transactions breakdown for this batch */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Customer Sales Ledger From This Batch ({selectedBatch.batchNumber})
            </h4>

            {batchSalesLines.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                No bags have been sold from this batch yet. All {selectedBatch.initialQuantity} {selectedBatch.unit} remain intact in stock!
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3 text-center">Bags Sold</th>
                      <th className="py-2.5 px-3 text-right">Batch Cost</th>
                      <th className="py-2.5 px-3 text-right">Selling Rate</th>
                      <th className="py-2.5 px-3 text-right">Total Bill</th>
                      <th className="py-2.5 px-3 text-right">Profit Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchSalesLines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold font-mono text-slate-900">
                          {line.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{line.invoiceDate}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {line.customerName}
                          <span className="text-[10px] text-slate-400 block">{line.customerType}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          {line.quantity} {line.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          ₹{line.batchCostRate}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                          ₹{line.sellingRate}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                          ₹{line.lineTotal.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                          +₹{line.lineProfit.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
