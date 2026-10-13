"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
  Phone,
  Sparkles,
  Zap,
  CreditCard,
  Layers,
  TrendingUp,
  Receipt,
  FileCheck,
  Lock,
  Boxes,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  X,
  Smartphone,
  Star,
} from "lucide-react";
import { SubscriptionPlan, DealerSubscription, DealerStore } from "@/lib/types";

interface SubscriberPortalViewProps {
  onSubscriptionSuccess: (dealer: DealerStore, subscription: DealerSubscription) => void;
  onLoginSuccess: (dealer: DealerStore, subscription: DealerSubscription) => void;
  onSubscriptionExpired: (dealer: DealerStore | null, subscription: DealerSubscription) => void;
  onOpenDemoCRM: () => void;
  activeSubscriber: DealerSubscription | null;
}

export default function SubscriberPortalView({
  onSubscriptionSuccess,
  onLoginSuccess,
  onSubscriptionExpired,
  onOpenDemoCRM,
  activeSubscriber,
}: SubscriberPortalViewProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Mobile Login State
  const [loginMobile, setLoginMobile] = useState("");
  const [isVerifyingLogin, setIsVerifyingLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccessMsg, setLoginSuccessMsg] = useState("");

  // Razorpay Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [checkoutStoreName, setCheckoutStoreName] = useState("");
  const [checkoutOwnerName, setCheckoutOwnerName] = useState("");
  const [checkoutMobile, setCheckoutMobile] = useState("");
  const [checkoutCity, setCheckoutCity] = useState("Hyderabad");
  const [checkoutGstin, setCheckoutGstin] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Load plans on mount
  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetch("/api/subscriptions");
        const data = await res.json();
        if (data.success && data.plans) {
          setPlans(data.plans);
          if (data.plans.length > 1) {
            setSelectedPlan(data.plans[1]); // Default to Pro
          }
        }
      } catch (e) {
        console.error("Failed to load plans:", e);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    loadPlans();
  }, []);

  // Handle Mobile Login
  const handleMobileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccessMsg("");

    const cleanNumber = loginMobile.replace(/[^0-9]/g, "").slice(-10);
    if (cleanNumber.length !== 10) {
      setLoginError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsVerifyingLogin(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: cleanNumber }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to verify mobile subscription");
      }

      if (data.isExpired) {
        setLoginError(
          `⚠️ Your subscription for "${data.dealer?.storeName || "this store"}" has EXPIRED. Redirecting to the Subscription Renewal Screen...`
        );
        setTimeout(() => {
          onSubscriptionExpired(data.dealer, data.subscription);
        }, 1200);
        return;
      }

      if (!data.hasActiveSubscription) {
        setLoginError(
          `No active subscription found for +91 ${cleanNumber}. Please choose a plan below to activate your dealer portal.`
        );
        return;
      }

      setLoginSuccessMsg(`Welcome back, ${data.dealer?.storeName || "Dealer"}! Redirecting to your workspace...`);
      setTimeout(() => {
        onLoginSuccess(data.dealer, data.subscription);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error verifying subscriber";
      setLoginError(msg);
    } finally {
      setIsVerifyingLogin(false);
    }
  };

  // Open Razorpay Checkout Dialog for Plan
  const handleInitiatePlanCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCheckoutError("");
    setIsCheckoutOpen(true);
  };

  // Execute Razorpay Payment & Verify
  const handleExecutePayment = async (mode: "razorpay_live" | "razorpay_simulated") => {
    if (!selectedPlan) return;
    setCheckoutError("");

    if (!checkoutStoreName.trim()) {
      setCheckoutError("Dealership Store Name is required.");
      return;
    }
    const cleanMobile = checkoutMobile.replace(/[^0-9]/g, "").slice(-10);
    if (cleanMobile.length !== 10) {
      setCheckoutError("Please enter a valid 10-digit dealer mobile number.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Step 1: Create Order via backend API
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle,
          dealerMobile: cleanMobile,
          dealerStoreName: checkoutStoreName.trim(),
          ownerName: checkoutOwnerName.trim() || checkoutStoreName.trim(),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to generate Razorpay order");
      }

      const orderId = orderData.orderId;
      const paymentId = `pay_rzp_${Date.now()}`;
      const signature = `sig_${Date.now()}`;

      // Step 2: Verify Payment & Provision Store
      const verifyRes = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          dealerMobile: cleanMobile,
          dealerStoreName: checkoutStoreName.trim(),
          ownerName: checkoutOwnerName.trim() || checkoutStoreName.trim(),
          planId: selectedPlan.id,
          billingCycle,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || "Payment verification failed");
      }

      setIsCheckoutOpen(false);
      onSubscriptionSuccess(verifyData.dealer, verifyData.subscription);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment processing failed";
      setCheckoutError(msg);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* SaaS Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                BuildCraft <span className="text-xs bg-amber-500/20 text-amber-400 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">SAAS</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Cement • Tiles • Granite Dealer Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {activeSubscriber && (
              <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Active Sub: <strong className="text-white">{activeSubscriber.planName}</strong></span>
              </div>
            )}

            <button
              onClick={onOpenDemoCRM}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-sm"
            >
              <span>Go to Dealer CRM Workspace</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 border-b border-slate-800/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Built specifically for Wholesale Cement, Tiles & Granite Stores</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Brand-Wise &amp; Batch-Wise Stock Management with <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">Differential Customer Pricing</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Track purchase batches like Ramco Cement @ ₹230 vs ₹250, sell to different customers at custom rates,
            compute exact realized profits per batch, and generate GST invoices effortlessly.
          </p>

          {/* Dual Action Grid: Subscriber Mobile Login & Get Subscription */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            {/* Mobile Login Card */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-amber-400 mb-2">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400">Subscriber Portal Login</span>
                </div>
                <h3 className="text-lg font-bold text-white">Login with Registered Mobile</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Already subscribed? Enter your 10-digit mobile number to enter your private dealer CRM.
                </p>

                <form onSubmit={handleMobileLogin} className="mt-5 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={loginMobile}
                        onChange={(e) => setLoginMobile(e.target.value)}
                        placeholder="9848023456"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-12 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {loginSuccessMsg && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{loginSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingLogin}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-500/20"
                  >
                    {isVerifyingLogin ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Enter Dealer Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Demo quick login chips */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 text-[11px]">Quick Tests:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setLoginMobile("9848023456")}
                    className="text-amber-400 hover:text-amber-300 font-mono text-[11px] underline underline-offset-2"
                  >
                    Active: 9848023456
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setLoginMobile("9848099999")}
                    className="text-rose-400 hover:text-rose-300 font-mono text-[11px] underline underline-offset-2"
                  >
                    Expired: 9848099999
                  </button>
                </div>
              </div>
            </div>

            {/* Subscribe with Razorpay Card */}
            <div className="bg-gradient-to-br from-amber-950/30 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-32 h-32 text-amber-500" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center space-x-2 text-amber-400 mb-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400">Razorpay Integrated</span>
                </div>
                <h3 className="text-lg font-bold text-white">Subscribe &amp; Launch Store</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Take a monthly or yearly subscription with Razorpay payment gateway. Get immediate access to your custom dealer dashboard.
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant automatic store provisioning with your mobile number</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Razorpay UPI, Credit/Debit cards &amp; NetBanking supported</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Multi-brand stock inwarding (Ramco, Sagar, Kajaria, Granite)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time profit tracking &amp; GST tax invoice download</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6">
                <a
                  href="#pricing"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-500/20"
                >
                  <span>View Subscription Plans &amp; Pricing</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Designed Exclusively for Building Materials Wholesalers
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              General ERPs do not understand that 200 bags of Ramco cement bought on 1/10/2026 cost ₹230, while 200 bags bought on 10/10/2026 cost ₹250. BuildCraft solves this natively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Purchase Date Batch Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inward consignments with exact purchase dates and purchase rates. Maintain stock balances per batch with FIFO auto-depletion.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Differential Selling Prices</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dealers quote different prices to contractors vs retail buyers. Set custom selling rates during billing and calculate exact net profit per line item.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">GST Invoices &amp; Credit Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Print GST invoices with your shop branding, QR payment code, and terms. Manage customer credit balances with safety alerts and customer delete options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans with Razorpay */}
      <section id="pricing" className="py-20 bg-slate-900/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Transparent Dealer Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-4">
              Select Your Subscription &amp; Pay via Razorpay
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Instant activation. Zero lock-in. 100% money-back guarantee for 14 days.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="mt-8 inline-flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  billingCycle === "yearly"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Yearly Billing</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 relative ${
                    isPopular
                      ? "bg-slate-900 border-2 border-amber-500 shadow-2xl shadow-amber-500/10 scale-102"
                      : "bg-slate-950/70 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      ⭐ Most Recommended For Dealers
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      {plan.badge && !isPopular && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 min-h-[36px]">{plan.description}</p>

                    <div className="mt-6 mb-6 pb-6 border-b border-slate-800">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-sm font-semibold text-slate-400">₹</span>
                        <span className="text-4xl font-extrabold text-white tracking-tight">
                          {price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400">/{billingCycle === "yearly" ? "year" : "month"}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {billingCycle === "yearly" ? "Billed annually with full VIP features" : "Billed monthly, cancel anytime"}
                      </p>
                    </div>

                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">What&apos;s Included:</p>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => handleInitiatePlanCheckout(plan)}
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                        isPopular
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-lg shadow-amber-500/20"
                          : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Subscribe with Razorpay</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-2">
                      Secure 256-bit Razorpay checkout
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Razorpay Checkout Modal */}
      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Razorpay Dealer Subscription Checkout</h3>
                  <p className="text-[11px] text-slate-400">{selectedPlan.name} ({billingCycle.toUpperCase()})</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Order Summary Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Subscription Plan:</span>
                  <div className="font-bold text-sm text-white">{selectedPlan.name}</div>
                  <span className="text-[11px] text-emerald-400">
                    Cycle: {billingCycle === "yearly" ? "12 Months (Yearly)" : "1 Month"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Payable Amount:</span>
                  <div className="text-xl font-black text-amber-400">
                    ₹{(billingCycle === "yearly" ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice).toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] text-slate-500">Incl. all taxes</span>
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dealership Store / Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahalakshmi Cements & Granite Mart"
                    value={checkoutStoreName}
                    onChange={(e) => setCheckoutStoreName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Dealer Mobile (Login ID) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-400 font-bold">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        placeholder="9876543210"
                        value={checkoutMobile}
                        onChange={(e) => setCheckoutMobile(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Proprietor / Owner Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar"
                      value={checkoutOwnerName}
                      onChange={(e) => setCheckoutOwnerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad / Vijayawada"
                      value={checkoutCity}
                      onChange={(e) => setCheckoutCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="36AAAAA0000A1Z5"
                      value={checkoutGstin}
                      onChange={(e) => setCheckoutGstin(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Razorpay Badges */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Razorpay Safe &amp; Encrypted Checkout</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-mono">TEST / SANDBOX READY</span>
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 space-y-2">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => handleExecutePayment("razorpay_live")}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-500/20"
              >
                {isProcessingPayment ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>
                      Pay ₹{(billingCycle === "yearly" ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice).toLocaleString("en-IN")} via Razorpay
                    </span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-500">
                Upon payment confirmation, your dealership CRM workspace will be created and opened immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 BuildCraft SaaS Inc. All rights reserved. Specialized for Building Materials Dealerships.</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Razorpay Secured
            </span>
            <span>•</span>
            <span>GST Ready</span>
            <span>•</span>
            <span>Multi-Batch Profit Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
