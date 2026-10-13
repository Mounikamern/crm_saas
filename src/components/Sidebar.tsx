"use client";

import React from "react";
import {
  LayoutDashboard,
  Boxes,
  TrendingUp,
  ReceiptText,
  FileSpreadsheet,
  Users,
  Settings,
  Database,
  Building2,
  Globe,
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  postgresConnected: boolean;
  onSwitchToSubscriberPortal?: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  postgresConnected,
  onSwitchToSubscriberPortal,
}: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "batches", label: "Stock & Batches", icon: Boxes, badge: "Brand & Batch" },
    { id: "batch-analytics", label: "Batch Profit Analysis", icon: TrendingUp, highlight: true },
    { id: "billing", label: "New Sale / Billing", icon: ReceiptText, badge: "Custom Rates" },
    { id: "invoices", label: "Invoices & Receipts", icon: FileSpreadsheet },
    { id: "customers", label: "Customers CRM", icon: Users },
    { id: "settings", label: "Store & Database", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            BuildCraft <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">CRM</span>
          </h1>
          <p className="text-[11px] text-slate-400">Cement • Tiles • Granite</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Inventory & Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : item.highlight ? "text-amber-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && !isActive && (
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Switch to Subscriber Portal Button */}
      {onSwitchToSubscriberPortal && (
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onSwitchToSubscriberPortal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all group"
          >
            <div className="flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Subscriber Portal</span>
            </div>
            <span className="text-[10px] text-amber-400/80">Pricing →</span>
          </button>
        </div>
      )}

      {/* Database Connection Status in Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center space-x-2 text-slate-300">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">PostgreSQL Status</span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              postgresConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          {postgresConnected ? (
            <span className="text-emerald-400">PostgreSQL Live Sync</span>
          ) : (
            <span className="text-amber-300">Local Cache (Zero-Config)</span>
          )}
        </p>
      </div>
    </aside>
  );
}
