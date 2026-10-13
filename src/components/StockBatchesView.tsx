"use client";

import React, { useState } from "react";
import {
  Boxes,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Package,
  Tag,
} from "lucide-react";
import { Batch, Brand, Category } from "@/lib/types";

interface StockBatchesViewProps {
  batches: Batch[];
  brands: Brand[];
  categories: Category[];
  onOpenNewBatchModal: () => void;
  onOpenNewBrandModal?: () => void;
  onSelectBatchForSale: (batchId: string) => void;
}

export default function StockBatchesView({
  batches,
  brands,
  categories,
  onOpenNewBatchModal,
  onOpenNewBrandModal,
  onSelectBatchForSale,
}: StockBatchesViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      (b.productName && b.productName.toLowerCase().includes(search.toLowerCase())) ||
      (b.brandName && b.brandName.toLowerCase().includes(search.toLowerCase())) ||
      b.purchaseDate.includes(search);

    const matchesBrand = selectedBrand === "ALL" || b.brandName === selectedBrand;
    const matchesStatus = selectedStatus === "ALL" || b.status === selectedStatus;

    let matchesCategory = true;
    if (selectedCategory !== "ALL") {
      if (selectedCategory === "Cement") matchesCategory = b.unit === "Bags";
      else if (selectedCategory === "Tiles") matchesCategory = b.unit === "Boxes";
      else if (selectedCategory === "Granite") matchesCategory = b.unit === "Sq.Ft";
    }

    return matchesSearch && matchesBrand && matchesStatus && matchesCategory;
  });

  // Calculate totals
  const totalStockValue = filteredBatches.reduce((acc, b) => acc + b.stockValueRemaining, 0);
  const totalBagsCement = filteredBatches
    .filter((b) => b.unit === "Bags")
    .reduce((acc, b) => acc + b.availableQuantity, 0);
  const totalBoxesTiles = filteredBatches
    .filter((b) => b.unit === "Boxes")
    .reduce((acc, b) => acc + b.availableQuantity, 0);
  const totalSqftGranite = filteredBatches
    .filter((b) => b.unit === "Sq.Ft")
    .reduce((acc, b) => acc + b.availableQuantity, 0);

  return (
    <div className="space-y-6">
      {/* Top Action & KPI bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Filtered Inventory Value</p>
          <h3 className="text-xl font-bold text-slate-900 mt-1">₹{totalStockValue.toLocaleString("en-IN")}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Cement In Stock</p>
          <h3 className="text-xl font-bold text-amber-600 mt-1">{totalBagsCement} <span className="text-xs text-slate-500">Bags</span></h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Tiles In Stock</p>
          <h3 className="text-xl font-bold text-blue-600 mt-1">{totalBoxesTiles} <span className="text-xs text-slate-500">Boxes</span></h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Granite In Stock</p>
          <h3 className="text-xl font-bold text-purple-600 mt-1">{totalSqftGranite} <span className="text-xs text-slate-500">Sq.Ft</span></h3>
        </div>
      </div>

      {/* Control & Filter Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by batch number, brand, product or date (YYYY-MM-DD)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onOpenNewBrandModal && (
              <button
                onClick={onOpenNewBrandModal}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-2xs"
              >
                <Tag className="w-3.5 h-3.5 text-slate-600" />
                <span>+ Add Brand</span>
              </button>
            )}

            <button
              onClick={onOpenNewBatchModal}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Inward New Stock Batch</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1 text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
          </div>

          {/* Category Filters */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
            {["ALL", "Cement", "Tiles", "Granite"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedCategory === cat ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Stock</option>
            <option value="DEPLETED">Depleted / Sold Out</option>
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Batches Inventory ({filteredBatches.length} batches found)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Sorted newest purchase date first
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 font-semibold">
                <th className="py-3 px-3.5">Batch Ref & Date</th>
                <th className="py-3 px-3.5">Brand & Product</th>
                <th className="py-3 px-3.5 text-right">Cost Rate</th>
                <th className="py-3 px-3.5 text-center">Initial Bought</th>
                <th className="py-3 px-3.5 text-center">Bags Sold</th>
                <th className="py-3 px-3.5 text-center">Stock Left</th>
                <th className="py-3 px-3.5 text-right">Remaining Value</th>
                <th className="py-3 px-3.5 text-right">Realized Profit</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                        <Boxes className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">No Stock Batches Inwarded Yet</h4>
                      <p className="text-xs text-slate-500">
                        For a new store, start by inwarding your first purchase batch of cement, tiles or granite with purchase rates and dates.
                      </p>
                      <button
                        onClick={onOpenNewBatchModal}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>+ Inward First Stock Batch</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const isDepleted = batch.availableQuantity <= 0;
                  const isLow = batch.availableQuantity > 0 && batch.availableQuantity <= 50;

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 font-mono">{batch.batchNumber}</div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <span>Purchase: {batch.purchaseDate}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-800">{batch.brandName}</div>
                        <div className="text-[11px] text-slate-500">{batch.productName}</div>
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                        ₹{batch.purchaseRate}
                        <span className="text-[10px] text-slate-400 font-normal ml-0.5">/{batch.unit}</span>
                      </td>
                      <td className="py-3 px-3.5 text-center font-medium text-slate-700">
                        {batch.initialQuantity} {batch.unit}
                      </td>
                      <td className="py-3 px-3.5 text-center font-semibold text-emerald-700 bg-emerald-50/30">
                        {batch.soldQuantity} {batch.unit}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            isDepleted
                              ? "bg-slate-100 text-slate-500 line-through"
                              : isLow
                              ? "bg-amber-100 text-amber-800 font-black"
                              : "bg-blue-50 text-blue-800 font-bold"
                          }`}
                        >
                          {batch.availableQuantity} {batch.unit}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-semibold text-slate-800">
                        ₹{batch.stockValueRemaining.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <span className="font-bold text-emerald-600">
                          +₹{batch.totalProfitRealized.toLocaleString("en-IN")}
                        </span>
                        {batch.profitMarginPercent > 0 && (
                          <div className="text-[10px] text-emerald-500">({batch.profitMarginPercent}%)</div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {isDepleted ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3 mr-1" /> Depleted
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {batch.availableQuantity > 0 ? (
                          <button
                            onClick={() => onSelectBatchForSale(batch.id)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-xs font-semibold transition-colors shadow-2xs"
                          >
                            Sell From Batch
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Sold Out</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
