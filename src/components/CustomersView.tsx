"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Building,
  Eye,
  CreditCard,
  ShoppingCart,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Customer, SaleInvoice } from "@/lib/types";
import CustomerDetailModal from "./CustomerDetailModal";

interface CustomersViewProps {
  customers: Customer[];
  invoices: SaleInvoice[];
  onOpenNewCustomerModal: () => void;
  onViewInvoice: (invoice: SaleInvoice) => void;
  onNavigateToBilling: (customerId?: string) => void;
  onCustomerUpdated: (customer: Customer) => void;
  onCustomerDeleted: (customerId: string) => void;
}

export default function CustomersView({
  customers,
  invoices,
  onOpenNewCustomerModal,
  onViewInvoice,
  onNavigateToBilling,
  onCustomerUpdated,
  onCustomerDeleted,
}: CustomersViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === "ALL" || c.customerType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalOutstanding = customers.reduce((acc, c) => acc + c.creditBalance, 0);
  const totalBilled = customers.reduce((acc, c) => acc + c.totalBilled, 0);

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to delete customer");
      }

      onCustomerDeleted(customerToDelete.id);
      setCustomerToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting customer";
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Registered Customers</p>
          <h3 className="text-xl font-bold text-slate-900 mt-1">{customers.length}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Contractors, builders & retail clients</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Lifetime Purchases</p>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">
            ₹{totalBilled.toLocaleString("en-IN")}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all customer sales</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Pending Credit (Receivables)</p>
          <h3 className="text-xl font-bold text-rose-600 mt-1">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </h3>
          <p className="text-[11px] text-rose-500 mt-0.5">Customer dues to collect</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-1 items-center space-x-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, phone number, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="CONTRACTOR">Contractors</option>
            <option value="BUILDER">Builders</option>
            <option value="RETAIL">Retail Individuals</option>
            <option value="WHOLESALE">Wholesale</option>
          </select>
        </div>

        <button
          onClick={onOpenNewCustomerModal}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Register New Customer</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Customer Directory & Financial Ledger ({filteredCustomers.length} accounts)
            </h3>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Click on any customer to view invoice history, collect credit, or delete record
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <th className="py-3 px-3.5">Customer & Type</th>
                <th className="py-3 px-3.5">Phone & GSTIN</th>
                <th className="py-3 px-3.5">Delivery Location</th>
                <th className="py-3 px-3.5 text-right">Lifetime Purchases</th>
                <th className="py-3 px-3.5 text-right">Total Paid</th>
                <th className="py-3 px-3.5 text-right">Credit Balance</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">No Customers Registered Yet</h4>
                      <p className="text-xs text-slate-500">
                        Add builders, contractors, and retail buyers to maintain customer credit ledgers, custom selling rates, and phone contacts.
                      </p>
                      <button
                        onClick={onOpenNewCustomerModal}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>+ Register First Customer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomerForDetail(c)}
                    className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {c.name}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {c.customerType}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">
                      <div className="font-mono">{c.phone || "N/A"}</div>
                      {c.gstin ? (
                        <div className="font-mono text-[10px] text-slate-500">GST: {c.gstin}</div>
                      ) : (
                        <div className="text-[10px] text-slate-400">Unregistered</div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">
                      <div className="font-medium text-slate-800">{c.city || "Local"}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{c.address}</div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-semibold text-slate-900">
                      ₹{c.totalBilled.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3.5 text-right font-semibold text-emerald-700">
                      ₹{c.totalPaid.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          c.creditBalance > 0
                            ? "bg-rose-50 text-rose-700 font-bold border border-rose-200"
                            : "text-slate-400"
                        }`}
                      >
                        ₹{c.creditBalance.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedCustomerForDetail(c)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold inline-flex items-center space-x-1 transition-colors"
                          title="View Invoices & Collect Due"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ledger</span>
                        </button>
                        <button
                          onClick={() => onNavigateToBilling(c.id)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-xs font-semibold inline-flex items-center space-x-1 transition-colors"
                          title="Create New Bill"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                          <span>Bill</span>
                        </button>
                        <button
                          onClick={() => setCustomerToDelete(c)}
                          className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded text-xs font-semibold inline-flex items-center transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360 Detail Modal */}
      {selectedCustomerForDetail && (
        <CustomerDetailModal
          customer={selectedCustomerForDetail}
          invoices={invoices}
          onClose={() => setSelectedCustomerForDetail(null)}
          onViewInvoice={onViewInvoice}
          onNavigateToBilling={onNavigateToBilling}
          onCustomerUpdated={(updated) => {
            setSelectedCustomerForDetail(updated);
            onCustomerUpdated(updated);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Delete Customer Account?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <strong>{customerToDelete.name}</strong>?
                </p>
              </div>
            </div>

            {customerToDelete.creditBalance > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Outstanding Credit Warning</span>
                </p>
                <p className="mt-1">
                  This customer still has a pending credit balance of{" "}
                  <strong>₹{customerToDelete.creditBalance.toLocaleString("en-IN")}</strong>. Deleting them will remove their record from your ledger.
                </p>
              </div>
            )}

            {deleteError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCustomer}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
