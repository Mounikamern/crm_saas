"use client";

import React, { useState } from "react";
import { X, Tag, Plus, AlertCircle } from "lucide-react";
import { Brand, Product } from "@/lib/types";

interface NewBrandModalProps {
  onClose: () => void;
  onBrandCreated: (brand: Brand, products?: Product[]) => void;
}

export default function NewBrandModal({ onClose, onBrandCreated }: NewBrandModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cement");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Brand name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create brand");
      }

      onBrandCreated(data.brand, data.products);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error creating brand";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">Add New Brand</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Brand Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. ACC Cement, Dalmia, Kajaria, Nitco"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Product Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="Cement">Cement (Bags)</option>
              <option value="Tiles">Tiles (Boxes)</option>
              <option value="Granite">Granite & Marble (Sq.Ft)</option>
              <option value="Sanitaryware">Sanitaryware & Fittings</option>
              <option value="Steel">Steel & TMT Bars</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Add Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
