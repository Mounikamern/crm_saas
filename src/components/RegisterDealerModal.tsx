"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Store,
  CreditCard,
  MapPin,
  Layers,
} from "lucide-react";
import { DealerStore } from "@/lib/types";

interface RegisterDealerModalProps {
  onClose: () => void;
  onDealerRegistered: (dealer: DealerStore) => void;
}

export default function RegisterDealerModal({
  onClose,
  onDealerRegistered,
}: RegisterDealerModalProps) {
  const [storeName, setStoreName] = useState("");
  const [dealerType, setDealerType] = useState("Wholesale Cement Dealer");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Vijayawada");
  const [state, setState] = useState("Andhra Pradesh");
  const [bankName, setBankName] = useState("State Bank of India");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");

  const availableBrands = [
    "Ramco Cement",
    "Sagar Cement",
    "Ultratech Cement",
    "ACC Cement",
    "Dalmia Cement",
    "Kajaria Tiles",
    "Somany Tiles",
    "Black Pearl Granite",
  ];
  const [selectedBrands, setSelectedBrands] = useState<string[]>([
    "Ramco Cement",
    "Sagar Cement",
    "Ultratech Cement",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleBrand = (b: string) => {
    if (selectedBrands.includes(b)) {
      setSelectedBrands(selectedBrands.filter((x) => x !== b));
    } else {
      setSelectedBrands([...selectedBrands, b]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!storeName.trim() || !ownerName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError("Please fill all required fields (Firm Name, Owner, Phone, Address, City).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dealers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeName.trim(),
          dealerType,
          ownerName: ownerName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          gstin: gstin.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          bankName: bankName.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          ifscCode: ifscCode.trim() || undefined,
          upiId: upiId.trim() || undefined,
          invoicePrefix: invoicePrefix.trim() || undefined,
          brandsHandled: selectedBrands,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to register dealer store");
      }

      onDealerRegistered(data.dealer);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error registering dealer";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Onboard & Register Wholesale Cement Dealer</h3>
              <p className="text-[11px] text-slate-400">Create new dealer workspace in BuildCraft CRM</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
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

          {/* Business Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Firm / Dealership Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sri Venkateswara Wholesale Cements"
                value={storeName}
                onChange={(e) => {
                  setStoreName(e.target.value);
                  if (!invoicePrefix && e.target.value) {
                    const initials = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
                    setInvoicePrefix(`INV-${initials || "DLR"}-`);
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Dealer Category
              </label>
              <select
                value={dealerType}
                onChange={(e) => setDealerType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                <option value="Wholesale Cement Dealer">Wholesale Cement Dealer (Depot / C&F)</option>
                <option value="Cement & Building Materials Mart">Cement & Building Materials Mart</option>
                <option value="Tiles & Granite Showroom">Tiles & Granite Showroom</option>
                <option value="Multi-Brand Building Materials Distributor">Multi-Brand Building Materials Distributor</option>
              </select>
            </div>
          </div>

          {/* Proprietor & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Proprietor / Owner Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Reddy"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="+91 98480 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                GSTIN Number (Optional)
              </label>
              <input
                type="text"
                placeholder="37ABCDE1234F1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Godown / Store Address *
              </label>
              <input
                type="text"
                required
                placeholder="Main Road, Industrial Estate / Bypass"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Primary Brands Handled */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 flex items-center justify-between">
              <span>Primary Brands Handled by this Dealer:</span>
              <span className="text-[10px] text-amber-700 font-bold">{selectedBrands.length} Selected</span>
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
              {availableBrands.map((b) => {
                const isSelected = selectedBrands.includes(b);
                return (
                  <button
                    type="button"
                    key={b}
                    onClick={() => toggleBrand(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {b} {isSelected ? "✓" : "+"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bank & Billing Setup */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span>Billing & Bank Details (for Invoices)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">UPI ID for Customer QR</label>
                <input
                  type="text"
                  placeholder="dealer@sbi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-amber-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  placeholder="INV-DLR-"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
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
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Onboarding Dealer..." : "Complete Registration & Switch Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
