"use client";

import React, { useState } from "react";
import { X, Boxes, Plus, AlertCircle, Calendar, Truck } from "lucide-react";
import { Product, Batch, Brand } from "@/lib/types";

interface NewBatchModalProps {
  products: Product[];
  brands?: Brand[];
  onClose: () => void;
  onBatchCreated: (batch: Batch) => void;
  onOpenNewBrandModal?: () => void;
}

export default function NewBatchModal({
  products,
  brands,
  onClose,
  onBatchCreated,
  onOpenNewBrandModal,
}: NewBatchModalProps) {
  const [productId, setProductId] = useState<string>(products[0]?.id || "");
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [purchaseRate, setPurchaseRate] = useState<number>(230);
  const [initialQuantity, setInitialQuantity] = useState<number>(200);
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [supplierName, setSupplierName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Keep productId updated when products array updates (e.g. after adding a new brand)
  React.useEffect(() => {
    if (products.length > 0) {
      const exists = products.some((p) => p.id === productId);
      if (!exists) {
        setProductId(products[0].id);
        if (products[0].defaultCostRate > 0) {
          setPurchaseRate(products[0].defaultCostRate);
        }
      }
    }
  }, [products, productId]);

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!productId || !purchaseDate || purchaseRate <= 0 || initialQuantity <= 0) {
      setError("Please fill all required fields with valid quantities and rates.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          purchaseDate,
          purchaseRate: Number(purchaseRate),
          initialQuantity: Number(initialQuantity),
          batchNumber: batchNumber.trim() || undefined,
          supplierName: supplierName.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to inward stock batch");
      }

      onBatchCreated(data.batch);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error creating batch";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCost = initialQuantity * purchaseRate;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold">Inward New Stock Consignment (Batch)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Product & Brand */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-semibold">
                Select Brand & Product *
              </label>
              {onOpenNewBrandModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewBrandModal();
                  }}
                  className="text-amber-600 hover:text-amber-700 font-semibold text-[11px] flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Brand</span>
                </button>
              )}
            </div>

            {products.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center justify-between">
                <span>No brands registered yet.</span>
                {onOpenNewBrandModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNewBrandModal();
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold"
                  >
                    + Add First Brand
                  </button>
                )}
              </div>
            ) : (
              <select
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  const p = products.find((x) => x.id === e.target.value);
                  if (p && p.defaultCostRate > 0) {
                    setPurchaseRate(p.defaultCostRate);
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    🏷️ Brand: {p.brandName || "Brand"} — {p.name} ({p.unit})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Purchase Date & Batch Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Batch Code / Reference
              </label>
              <input
                type="text"
                placeholder="Leave blank to auto-generate"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Quantity & Purchase Cost Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Bags / Quantity Purchased *
              </label>
              <input
                type="number"
                min="1"
                required
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Unit: {selectedProduct?.unit || "Units"}
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Cost Rate / Unit (₹) *
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                e.g. ₹230 or ₹250
              </span>
            </div>
          </div>

          {/* Supplier Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Supplier / Factory Depot Name
            </label>
            <input
              type="text"
              placeholder="e.g. The Ramco Cements Ltd Depot / Sagar Cements"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Batch Remarks / Lorry Receipt No
            </label>
            <input
              type="text"
              placeholder="e.g. Consignment LR #4812, Unloaded in Bay 2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          {/* Inward Consignment Summary Card */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
            <span className="text-amber-900 font-medium">Total Inward Purchase Cost:</span>
            <span className="text-base font-bold text-amber-950">
              ₹{totalCost.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving Batch..." : "Confirm & Inward Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
