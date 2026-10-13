"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  PlusCircle,
  ShoppingCart,
  Store,
  Database,
  ChevronDown,
  Building2,
  Check,
  UserPlus,
  Tag,
  Globe,
  Sparkles,
} from "lucide-react";
import { StoreSetting, DealerStore } from "@/lib/types";

interface HeaderProps {
  currentTab: string;
  settings: StoreSetting | null;
  dealers: DealerStore[];
  postgresConnected: boolean;
  onOpenNewBatchModal: () => void;
  onOpenNewBrandModal: () => void;
  onNavigateToBilling: () => void;
  onOpenRegisterDealerModal: () => void;
  onSwitchDealer: (dealerId: string) => void;
  onSwitchToSubscriberPortal: () => void;
  activeSubscriberMobile?: string;
  activeSubscriptionPlan?: string;
}

export default function Header({
  currentTab,
  settings,
  dealers,
  postgresConnected,
  onOpenNewBatchModal,
  onOpenNewBrandModal,
  onNavigateToBilling,
  onOpenRegisterDealerModal,
  onSwitchDealer,
  onSwitchToSubscriberPortal,
  activeSubscriberMobile,
  activeSubscriptionPlan,
}: HeaderProps) {
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStoreDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Business Overview & Analytics",
      subtitle: "Real-time stock valuation, profits & daily cash flow",
    },
    batches: {
      title: "Stock & Batch Management",
      subtitle: "Track inventory brand-wise and purchase-date batch-wise",
    },
    "batch-analytics": {
      title: "Batch-wise Profit & Sales Analysis",
      subtitle: "Breakdown of units sold, remaining stock & realized profit per purchase batch",
    },
    billing: {
      title: "New Sale Invoice & Billing",
      subtitle: "Create customer bills with batch allocation & flexible customer pricing",
    },
    invoices: {
      title: "Sales Invoices & Tax Receipts",
      subtitle: "View, download PDF & print GST sales invoices",
    },
    customers: {
      title: "Customers CRM & Credit Ledger",
      subtitle: "Contractor, builder & retail customer balances and purchase history",
    },
    settings: {
      title: "Store Settings & Database Configuration",
      subtitle: "Dealer profile, tax credentials, invoice templates & PostgreSQL connection",
    },
  };

  const headerInfo = titles[currentTab] || {
    title: "BuildCraft CRM",
    subtitle: "Cements, Tiles & Granite Store Management",
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{headerInfo.title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{headerInfo.subtitle}</p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Dealer Store Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
          >
            <Store className="w-3.5 h-3.5 text-amber-600" />
            <span className="truncate max-w-[180px]">{settings?.storeName || "BuildCraft Mart"}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isStoreDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Active Dealership Store
              </div>

              <div className="space-y-1 my-1 max-h-48 overflow-y-auto">
                {dealers.map((d) => {
                  const isActive = d.id === settings?.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSwitchDealer(d.id);
                        setIsStoreDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg flex items-start justify-between transition-colors ${
                        isActive ? "bg-amber-50 text-amber-950 font-bold" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{d.storeName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {d.dealerType || "Wholesale Dealer"} • {d.city}
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsStoreDropdownOpen(false);
                    onOpenRegisterDealerModal();
                  }}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all text-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Register New Wholesale Dealer</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DB Status Pill */}
        <div
          className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
            postgresConnected
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
          title={
            postgresConnected
              ? "Connected to PostgreSQL"
              : "Running on zero-config local storage. PostgreSQL can be synced anytime."
          }
        >
          <Database className="w-3.5 h-3.5" />
          <span>{postgresConnected ? "Postgres Live" : "Local DB Active"}</span>
        </div>

        {/* Active Subscriber Pill */}
        {activeSubscriberMobile && (
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {activeSubscriptionPlan || "Subscribed"} • {activeSubscriberMobile}
            </span>
          </div>
        )}

        {/* Switch to Subscriber Portal Button */}
        <button
          onClick={onSwitchToSubscriberPortal}
          title="Switch to Public Subscriber Portal & Pricing Website"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-2xs"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Subscriber Portal</span>
        </button>

        {/* Quick Add Brand Button */}
        <button
          onClick={onOpenNewBrandModal}
          title="Create a new Cement, Tiles or Granite Brand"
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-2xs"
        >
          <Tag className="w-3.5 h-3.5 text-slate-600" />
          <span>+ Brand</span>
        </button>

        {/* Quick Stock Inward Button */}
        <button
          onClick={onOpenNewBatchModal}
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-2xs"
        >
          <PlusCircle className="w-4 h-4 text-slate-600" />
          <span>+ Inward Batch</span>
        </button>

        {/* Quick New Sale Button */}
        <button
          onClick={onNavigateToBilling}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>+ New Sale Bill</span>
        </button>
      </div>
    </header>
  );
}
