"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  RotateCcw,
  CreditCard,
  Building2,
  CheckCircle2,
  ArrowRight,
  Phone,
  Sparkles,
  Zap,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Calendar,
  Layers,
} from "lucide-react";
import { DealerSubscription, DealerStore, SubscriptionPlan } from "@/lib/types";

interface SubscriptionRenewalViewProps {
  subscription: DealerSubscription | null;
  dealer: DealerStore | null;
  onRenewSuccess: (dealer: DealerStore, subscription: DealerSubscription) => void;
  onSwitchMobile: () => void;
  onOpenDemoStore: () => void;
}

export default function SubscriptionRenewalView({
  subscription,
  dealer,
  onRenewSuccess,
  onSwitchMobile,
  onOpenDemoStore,
}: SubscriptionRenewalViewProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(subscription?.planId || "pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetch("/api/subscriptions");
        const data = await res.json();
        if (data.success && data.plans) {
          setPlans(data.plans);
          if (subscription?.planId) {
            setSelectedPlanId(subscription.planId);
          }
        }
      } catch (e) {
        console.error("Failed to load plans:", e);
      }
    }
    loadPlans();
  }, [subscription?.planId]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1] || plans[0];
  const payableAmount = selectedPlan
    ? billingCycle === "yearly"
      ? selectedPlan.yearlyPrice
      : selectedPlan.monthlyPrice
    : 24999;

  const handleRenewPayment = async () => {
    if (!selectedPlan) return;
    setErrorMsg("");
    setIsProcessing(true);

    try {
      const mobile = subscription?.dealerMobile || dealer?.phone || "9848099999";
      const storeName = subscription?.dealerStoreName || dealer?.storeName || "My Dealership Store";
      const ownerName = subscription?.ownerName || dealer?.ownerName || "Dealer";

      // Step 1: Create Razorpay Order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle,
          dealerMobile: mobile,
          dealerStoreName: storeName,
          ownerName,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to initiate renewal order");
      }

      // Step 2: Verify & Activate
      const verifyRes = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_renew_${Date.now()}`,
          razorpaySignature: `sig_renew_${Date.now()}`,
          dealerMobile: mobile,
          dealerStoreName: storeName,
          ownerName,
          planId: selectedPlan.id,
          billingCycle,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || "Renewal verification failed");
      }

      onRenewSuccess(verifyData.dealer, verifyData.subscription);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Renewal failed";
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedExpiryDate = subscription?.endDate
    ? new Date(subscription.endDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Expired";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Warning Banner */}
      <header className="border-b border-rose-900/60 bg-rose-950/40 px-6 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-bold text-rose-300">
            Subscription Expired: Dealership Workspace Locked
          </span>
          <span className="text-rose-500">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Store: <strong className="text-white">{dealer?.storeName || subscription?.dealerStoreName || "Dealership"}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onSwitchMobile}
            className="text-slate-400 hover:text-white text-xs underline underline-offset-2 transition-colors"
          >
            ← Login with Different Mobile
          </button>
          <button
            onClick={onOpenDemoStore}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Open Demo Store (Sri Balaji)
          </button>
        </div>
      </header>

      {/* Main Renewal Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col justify-center">
        {/* Lock Alert Header Card */}
        <div className="bg-slate-900/90 border border-rose-800/60 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Lock className="w-32 h-32 text-rose-500" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Lock className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>Access Suspended</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Your Dealership Subscription Has Expired
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Your store workspace and access to stock batches, custom billing, and profit ledger have been locked.
                  Renew below with Razorpay to restore instant access to all your dealership records.
                </p>
              </div>
            </div>

            {/* Suspended Account Metadata Pill */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shrink-0 text-xs w-full sm:w-auto min-w-[220px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                Dealership Details
              </span>
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-400 text-[11px]">Store:</span>{" "}
                  <strong className="text-white font-semibold">
                    {dealer?.storeName || subscription?.dealerStoreName || "Deccan Cements"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Mobile ID:</span>{" "}
                  <span className="font-mono text-amber-400">
                    {subscription?.dealerMobile || dealer?.phone || "+91 98480 99999"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Expired On:</span>{" "}
                  <span className="text-rose-400 font-semibold">{formattedExpiryDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Renewal Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <span>Select Renewal Plan &amp; Pay with Razorpay</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose your renewal cycle. Instant unlocking upon Razorpay verification.
              </p>
            </div>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  billingCycle === "yearly"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Yearly</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {plans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              const price = billingCycle === "yearly" ? p.yearlyPrice : p.monthlyPrice;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`rounded-xl p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/50"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-base">{p.name}</h3>
                      {p.popular && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 min-h-[30px]">{p.description}</p>

                    <div className="mt-4 mb-4 pb-4 border-b border-slate-800">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-xs text-slate-400">₹</span>
                        <span className="text-2xl font-black text-white">{price.toLocaleString("en-IN")}</span>
                        <span className="text-[11px] text-slate-400">/{billingCycle === "yearly" ? "yr" : "mo"}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-300 mb-4">
                      {p.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span
                      className={`block w-full py-1.5 text-center text-xs font-bold rounded-lg ${
                        isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {isSelected ? "Selected Plan" : "Choose Plan"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Checkout Action Bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400">Total Renewal Amount:</span>
              <div className="text-2xl font-black text-amber-400">
                ₹{payableAmount.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-slate-400 ml-1.5">
                  ({billingCycle === "yearly" ? "Yearly Renewal" : "Monthly Renewal"})
                </span>
              </div>
            </div>

            <button
              onClick={handleRenewPayment}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 shrink-0"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Renew Subscription via Razorpay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
