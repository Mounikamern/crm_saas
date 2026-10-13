"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardView from "@/components/DashboardView";
import StockBatchesView from "@/components/StockBatchesView";
import BatchProfitAnalyticsView from "@/components/BatchProfitAnalyticsView";
import BillingView from "@/components/BillingView";
import InvoicesView from "@/components/InvoicesView";
import CustomersView from "@/components/CustomersView";
import SettingsView from "@/components/SettingsView";
import InvoiceModal from "@/components/InvoiceModal";
import NewBatchModal from "@/components/NewBatchModal";
import NewBrandModal from "@/components/NewBrandModal";
import NewCustomerModal from "@/components/NewCustomerModal";
import RegisterDealerModal from "@/components/RegisterDealerModal";
import SubscriberPortalView from "@/components/SubscriberPortalView";
import SubscriptionRenewalView from "@/components/SubscriptionRenewalView";
import {
  Product,
  Batch,
  BatchProfitSummary,
  SaleInvoice,
  Customer,
  Brand,
  Category,
  DashboardStats,
  StoreSetting,
  DealerStore,
  DealerSubscription,
} from "@/lib/types";
import { Sparkles, ArrowRight, ShieldCheck, Globe, Building2, Lock, RotateCcw } from "lucide-react";

export default function App() {
  // Website Mode: "subscriber" (Website 1: Landing, Pricing, Razorpay, Mobile Login)
  //               vs "dealer" (Website 2: Private Dealer CRM Workspace)
  const [portalMode, setPortalMode] = useState<"subscriber" | "dealer">("dealer");
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSummaries, setBatchSummaries] = useState<BatchProfitSummary[]>([]);
  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<StoreSetting | null>(null);
  const [dealers, setDealers] = useState<DealerStore[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<DealerSubscription | null>(null);
  const [isStoreExpired, setIsStoreExpired] = useState<boolean>(false);
  const [postgresConnected, setPostgresConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Navigation helpers
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [isNewBrandModalOpen, setIsNewBrandModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isRegisterDealerModalOpen, setIsRegisterDealerModalOpen] = useState(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<SaleInvoice | null>(null);
  const [selectedInitialBatchId, setSelectedInitialBatchId] = useState<string | undefined>(undefined);
  const [selectedInitialCustomerId, setSelectedInitialCustomerId] = useState<string | undefined>(undefined);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [
        prodRes,
        batchRes,
        analyticsRes,
        custRes,
        salesRes,
        settingsRes,
        dealersRes,
        dbStatusRes,
        subsRes,
      ] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/batches").then((r) => r.json()),
        fetch("/api/analytics").then((r) => r.json()),
        fetch("/api/customers").then((r) => r.json()),
        fetch("/api/sales").then((r) => r.json()),
        fetch("/api/settings").then((r) => r.json()),
        fetch("/api/dealers").then((r) => r.json()),
        fetch("/api/db-status").then((r) => r.json()),
        fetch("/api/subscriptions").then((r) => r.json()),
      ]);

      if (prodRes.success) {
        setProducts(prodRes.products || []);
        setBrands(prodRes.brands || []);
        setCategories(prodRes.categories || []);
      }
      if (batchRes.success) setBatches(batchRes.batches || []);
      if (analyticsRes.success) {
        setBatchSummaries(analyticsRes.batchSummaries || []);
        setStats(analyticsRes.dashboardStats || null);
      }
      if (custRes.success) setCustomers(custRes.customers || []);
      if (salesRes.success) setInvoices(salesRes.invoices || []);
      if (settingsRes.success) setSettings(settingsRes.settings || null);
      if (dealersRes.success) setDealers(dealersRes.dealers || []);
      if (dbStatusRes.success) setPostgresConnected(dbStatusRes.postgresConnected || false);

      if (subsRes.success && subsRes.subscriptions?.length > 0) {
        const cleanPhone = (settingsRes.settings?.phone || "").replace(/[^0-9]/g, "").slice(-10);
        const sub =
          subsRes.subscriptions.find(
            (s: DealerSubscription) => s.dealerMobile.replace(/[^0-9]/g, "").slice(-10) === cleanPhone
          ) || subsRes.subscriptions[0];

        if (sub) {
          setCurrentSubscription(sub);
          const expired =
            sub.status === "EXPIRED" ||
            sub.status === "CANCELLED" ||
            (sub.endDate && new Date(sub.endDate).getTime() < Date.now());
          setIsStoreExpired(Boolean(expired));
        }
      }
    } catch (err) {
      console.error("Error loading CRM data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleBatchCreated = (newBatch: Batch) => {
    setBatches((prev) => [newBatch, ...prev]);
    fetchData(); // Refresh analytics and stats
  };

  const handleBrandCreated = (newBrand: Brand, updatedProducts?: Product[]) => {
    setBrands((prev) => {
      if (prev.some((b) => b.id === newBrand.id)) return prev;
      return [...prev, newBrand];
    });
    if (updatedProducts && updatedProducts.length > 0) {
      setProducts(updatedProducts);
    }
    fetchData();
  };

  const handleCustomerCreated = (newCust: Customer) => {
    setCustomers((prev) => [newCust, ...prev]);
  };

  const handleCustomerUpdated = (updatedCust: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
    );
    fetchData();
  };

  const handleCustomerDeleted = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    fetchData();
  };

  const handleInvoiceCreated = (newInvoice: SaleInvoice) => {
    setSelectedInvoiceForModal(newInvoice);
    fetchData(); // Deducts stock and updates profits
  };

  const handleSelectBatchForSale = (batchId: string) => {
    setSelectedInitialBatchId(batchId);
    setSelectedInitialCustomerId(undefined);
    setCurrentTab("billing");
  };

  const handleDealerRegistered = (newDealer: DealerStore) => {
    setDealers((prev) => [...prev, newDealer]);
    setSettings(newDealer);
    setIsStoreExpired(false);
    fetchData();
  };

  const handleSwitchDealer = async (dealerId: string) => {
    try {
      const res = await fetch("/api/dealers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealerId }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.activeDealer);
        setIsStoreExpired(false);
        fetchData();
      }
    } catch (err) {
      console.error("Error switching dealer:", err);
    }
  };

  // Called when Razorpay subscription succeeds on Website 1
  const handleSubscriptionSuccess = (newDealer: DealerStore, subscription: DealerSubscription) => {
    setCurrentSubscription(subscription);
    setSettings(newDealer);
    setIsStoreExpired(false);
    setPortalMode("dealer");
    fetchData();
  };

  // Called when mobile login succeeds on Website 1
  const handleLoginSuccess = (dealer: DealerStore, subscription: DealerSubscription) => {
    setCurrentSubscription(subscription);
    if (dealer) setSettings(dealer);
    setIsStoreExpired(false);
    setPortalMode("dealer");
    fetchData();
  };

  // Called when mobile login encounters an expired subscription on Website 1
  const handleSubscriptionExpired = (dealer: DealerStore | null, subscription: DealerSubscription) => {
    setCurrentSubscription(subscription);
    if (dealer) setSettings(dealer);
    setIsStoreExpired(true);
    setPortalMode("dealer");
  };

  // Called when Razorpay renewal completes on Renewal Screen
  const handleRenewSuccess = (renewedDealer: DealerStore, renewedSubscription: DealerSubscription) => {
    setCurrentSubscription(renewedSubscription);
    if (renewedDealer) setSettings(renewedDealer);
    setIsStoreExpired(false);
    fetchData();
  };

  // 1. If in Subscriber Portal Website mode, render Website 1
  if (portalMode === "subscriber") {
    return (
      <SubscriberPortalView
        onSubscriptionSuccess={handleSubscriptionSuccess}
        onLoginSuccess={handleLoginSuccess}
        onSubscriptionExpired={handleSubscriptionExpired}
        onOpenDemoCRM={() => {
          setIsStoreExpired(false);
          setPortalMode("dealer");
        }}
        activeSubscriber={currentSubscription}
      />
    );
  }

  // 2. If the subscription is EXPIRED, THE STORE WON'T OPEN. Show Renewal Screen instead!
  if (isStoreExpired) {
    return (
      <SubscriptionRenewalView
        subscription={currentSubscription}
        dealer={settings}
        onRenewSuccess={handleRenewSuccess}
        onSwitchMobile={() => {
          setIsStoreExpired(false);
          setPortalMode("subscriber");
        }}
        onOpenDemoStore={() => {
          setIsStoreExpired(false);
          handleSwitchDealer("store_main");
        }}
      />
    );
  }

  // 3. Otherwise, render Website 2 (Active Dealer CRM Workspace)
  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden flex-col">
      {/* Top Universal Mode Switcher Bar */}
      <div className="bg-slate-950 text-slate-200 px-6 py-2 text-xs flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-100">
            Website 2: Dealer CRM Active
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Store: <strong className="text-amber-400 font-bold">{settings?.storeName || "BuildCraft Mart"}</strong>
          </span>
          {settings?.phone && (
            <span className="text-slate-500 hidden md:inline">
              (Login ID: {settings.phone})
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Test Expiry Simulation Button */}
          <button
            onClick={() => setIsStoreExpired(true)}
            title="Simulate subscription expiry to inspect the renewal screen"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-[11px] font-semibold transition-all"
          >
            <Lock className="w-3 h-3 text-rose-400" />
            <span className="hidden md:inline">Simulate Expiry</span>
          </button>

          <button
            onClick={() => setPortalMode("subscriber")}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Switch to Website 1 (Subscriber Portal &amp; Razorpay)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setSelectedInitialBatchId(undefined);
            setSelectedInitialCustomerId(undefined);
            setCurrentTab(tab);
          }}
          postgresConnected={postgresConnected}
          onSwitchToSubscriberPortal={() => setPortalMode("subscriber")}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            currentTab={currentTab}
            settings={settings}
            dealers={dealers}
            postgresConnected={postgresConnected}
            onOpenNewBatchModal={() => setIsNewBatchModalOpen(true)}
            onOpenNewBrandModal={() => setIsNewBrandModalOpen(true)}
            onNavigateToBilling={() => {
              setSelectedInitialBatchId(undefined);
              setSelectedInitialCustomerId(undefined);
              setCurrentTab("billing");
            }}
            onOpenRegisterDealerModal={() => setIsRegisterDealerModalOpen(true)}
            onSwitchDealer={handleSwitchDealer}
            onSwitchToSubscriberPortal={() => setPortalMode("subscriber")}
            activeSubscriberMobile={settings?.phone || currentSubscription?.dealerMobile}
            activeSubscriptionPlan={currentSubscription?.planName || "Pro Plan"}
          />

          <main className="flex-1 overflow-y-auto p-8">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">
                    Loading Building Materials CRM...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {currentTab === "dashboard" && (
                  <DashboardView
                    stats={stats}
                    batches={batches}
                    onNavigateToTab={setCurrentTab}
                    onViewInvoice={setSelectedInvoiceForModal}
                    onOpenNewBatchModal={() => setIsNewBatchModalOpen(true)}
                  />
                )}

                {currentTab === "batches" && (
                  <StockBatchesView
                    batches={batches}
                    brands={brands}
                    categories={categories}
                    onOpenNewBatchModal={() => setIsNewBatchModalOpen(true)}
                    onOpenNewBrandModal={() => setIsNewBrandModalOpen(true)}
                    onSelectBatchForSale={handleSelectBatchForSale}
                  />
                )}

                {currentTab === "batch-analytics" && (
                  <BatchProfitAnalyticsView
                    batchSummaries={batchSummaries}
                    invoices={invoices}
                  />
                )}

                {currentTab === "billing" && (
                  <BillingView
                    products={products}
                    batches={batches}
                    customers={customers}
                    brands={brands}
                    selectedInitialBatchId={selectedInitialBatchId}
                    selectedInitialCustomerId={selectedInitialCustomerId}
                    onInvoiceCreated={handleInvoiceCreated}
                    onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
                    onOpenNewBatchModal={() => setIsNewBatchModalOpen(true)}
                    onOpenNewBrandModal={() => setIsNewBrandModalOpen(true)}
                  />
                )}

                {currentTab === "invoices" && (
                  <InvoicesView
                    invoices={invoices}
                    onViewInvoice={setSelectedInvoiceForModal}
                    onNavigateToBilling={() => setCurrentTab("billing")}
                  />
                )}

                {currentTab === "customers" && (
                  <CustomersView
                    customers={customers}
                    invoices={invoices}
                    onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
                    onViewInvoice={setSelectedInvoiceForModal}
                    onNavigateToBilling={(custId) => {
                      setSelectedInitialCustomerId(custId);
                      setSelectedInitialBatchId(undefined);
                      setCurrentTab("billing");
                    }}
                    onCustomerUpdated={handleCustomerUpdated}
                    onCustomerDeleted={handleCustomerDeleted}
                  />
                )}

                {currentTab === "settings" && (
                  <SettingsView
                    settings={settings}
                    postgresConnected={postgresConnected}
                    onSettingsUpdated={(newSettings) => setSettings(newSettings)}
                    onRefreshDBStatus={fetchData}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {selectedInvoiceForModal && (
        <InvoiceModal
          invoice={selectedInvoiceForModal}
          settings={settings}
          onClose={() => setSelectedInvoiceForModal(null)}
        />
      )}

      {isNewBatchModalOpen && (
        <NewBatchModal
          products={products}
          brands={brands}
          onClose={() => setIsNewBatchModalOpen(false)}
          onBatchCreated={handleBatchCreated}
          onOpenNewBrandModal={() => setIsNewBrandModalOpen(true)}
        />
      )}

      {isNewBrandModalOpen && (
        <NewBrandModal
          onClose={() => setIsNewBrandModalOpen(false)}
          onBrandCreated={handleBrandCreated}
        />
      )}

      {isNewCustomerModalOpen && (
        <NewCustomerModal
          onClose={() => setIsNewCustomerModalOpen(false)}
          onCustomerCreated={handleCustomerCreated}
        />
      )}

      {isRegisterDealerModalOpen && (
        <RegisterDealerModal
          onClose={() => setIsRegisterDealerModalOpen(false)}
          onDealerRegistered={handleDealerRegistered}
        />
      )}
    </div>
  );
}
