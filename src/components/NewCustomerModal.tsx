"use client";

import React, { useState } from "react";
import { X, UserPlus, AlertCircle } from "lucide-react";
import { Customer } from "@/lib/types";

interface NewCustomerModalProps {
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
}

export default function NewCustomerModal({
  onClose,
  onCustomerCreated,
}: NewCustomerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Vijayawada");
  const [gstin, setGstin] = useState("");
  const [customerType, setCustomerType] = useState<"CONTRACTOR" | "BUILDER" | "RETAIL" | "WHOLESALE">("CONTRACTOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          gstin: gstin.trim() || undefined,
          customerType,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create customer");
      }

      onCustomerCreated(data.customer);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error creating customer";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold">Register New Customer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Customer / Firm Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Contractors / Sri Builders"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Customer Type
              </label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                <option value="CONTRACTOR">Contractor</option>
                <option value="BUILDER">Builder / Developer</option>
                <option value="RETAIL">Retail Individual</option>
                <option value="WHOLESALE">Wholesale Store</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98480 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                GSTIN (Optional)
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

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Billing & Delivery Site Address
            </label>
            <textarea
              rows={2}
              placeholder="Site location, Plot #, Landmark..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

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
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
