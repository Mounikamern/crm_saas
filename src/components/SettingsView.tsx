"use client";

import React, { useState } from "react";
import {
  Store,
  Database,
  Building,
  CreditCard,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Terminal,
  RefreshCw,
} from "lucide-react";
import { StoreSetting } from "@/lib/types";

interface SettingsViewProps {
  settings: StoreSetting | null;
  postgresConnected: boolean;
  onSettingsUpdated: (settings: StoreSetting) => void;
  onRefreshDBStatus: () => void;
}

export default function SettingsView({
  settings,
  postgresConnected,
  onSettingsUpdated,
  onRefreshDBStatus,
}: SettingsViewProps) {
  const [formData, setFormData] = useState<StoreSetting>(
    settings || {
      id: "store_main",
      storeName: "Sri Balaji Cements & Granite Mart",
      tagline: "Authorized Distributors for Ramco, Sagar, Ultratech & Kajaria Tiles",
      dealerType: "Wholesale & Retail Cement & Building Materials Dealer",
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
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (field: keyof StoreSetting, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        onSettingsUpdated(data.settings);
        setSuccessMessage("Store settings and invoice template saved successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* PostgreSQL Database Status Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl ${
                postgresConnected ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                PostgreSQL & Prisma Database Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Connection status and persistence architecture
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshDBStatus}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check DB Connection</span>
          </button>
        </div>

        <div
          className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
            postgresConnected
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}
        >
          {postgresConnected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}

          <div className="space-y-2">
            <div className="font-bold text-sm">
              {postgresConnected ? "Connected to PostgreSQL" : "Running on Local Zero-Config Persistent Store"}
            </div>
            <p className="leading-relaxed">
              {postgresConnected
                ? "Your application is actively querying and writing directly to your PostgreSQL database using Prisma ORM."
                : "PostgreSQL is not currently running on port 5432. All data (batches, differential customer sales, profit tracking, and store settings) is stored persistently in the high-speed local data repository (`src/data/db-store.json`). You can use the app immediately without any setup!"}
            </p>

            {!postgresConnected && (
              <div className="pt-2 text-xs text-slate-800 space-y-1">
                <span className="font-bold">To connect your PostgreSQL database at any time:</span>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-slate-700">
                  <li>
                    Set your PostgreSQL connection string in <code className="bg-white/80 px-1 py-0.5 rounded font-mono border">.env</code>:
                    <br />
                    <code className="text-slate-900 font-mono text-[10px] bg-white px-2 py-1 rounded block my-1 border">
                      DATABASE_URL=&quot;postgresql://postgres:password@localhost:5432/crm_db?schema=public&quot;
                    </code>
                  </li>
                  <li>
                    Run Prisma schema push to create the tables in PostgreSQL:
                    <br />
                    <code className="text-slate-900 font-mono text-[10px] bg-white px-2 py-1 rounded inline-block my-0.5 border">
                      npx prisma db push
                    </code>
                  </li>
                  <li>
                    (Optional) Seed all sample batches (Ramco, Sagar, Tiles, Granite) into PostgreSQL:
                    <br />
                    <code className="text-slate-900 font-mono text-[10px] bg-white px-2 py-1 rounded inline-block my-0.5 border">
                      npm run db:seed
                    </code>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Store Profile & Invoice Header Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Store Profile & Invoicing Details</h3>
              <p className="text-xs text-slate-500">Information printed on customer tax invoices</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Store / Dealer Name</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => handleChange("storeName", e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tagline / Business Subtitle</label>
            <input
              type="text"
              value={formData.tagline || ""}
              onChange={(e) => handleChange("tagline", e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dealer GSTIN Number</label>
            <input
              type="text"
              value={formData.gstin || ""}
              onChange={(e) => handleChange("gstin", e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Invoice Number Prefix</label>
            <input
              type="text"
              value={formData.invoicePrefix}
              onChange={(e) => handleChange("invoicePrefix", e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Store Address & City</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Bank & Payment Details for Invoices */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center space-x-1.5">
            <CreditCard className="w-4 h-4 text-slate-500" />
            <span>Bank & UPI Details (Printed on Invoice for Customer Payments)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName || ""}
                onChange={(e) => handleChange("bankName", e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber || ""}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode || ""}
                onChange={(e) => handleChange("ifscCode", e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">UPI ID for Payment</label>
              <input
                type="text"
                value={formData.upiId || ""}
                onChange={(e) => handleChange("upiId", e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-amber-700 font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Invoice Terms & Conditions</label>
              <textarea
                rows={3}
                value={formData.invoiceTerms || ""}
                onChange={(e) => handleChange("invoiceTerms", e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
