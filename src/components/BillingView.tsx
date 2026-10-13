"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Trash2,
  FileCheck,
  User,
  AlertCircle,
  TrendingUp,
  Receipt,
  Sparkles,
  CreditCard,
  Building,
} from "lucide-react";
import { Product, Batch, Customer, SaleInvoice, Brand } from "@/lib/types";

interface BillingViewProps {
  products: Product[];
  batches: Batch[];
  customers: Customer[];
  brands?: Brand[];
  selectedInitialBatchId?: string;
  selectedInitialCustomerId?: string;
  onInvoiceCreated: (invoice: SaleInvoice) => void;
  onOpenNewCustomerModal: () => void;
  onOpenNewBatchModal?: () => void;
  onOpenNewBrandModal?: () => void;
}

interface CartItem {
  productId: string;
  productName: string;
  brandName: string;
  batchId: string;
  batchNumber: string;
  batchPurchaseDate: string;
  unit: string;
  availableStock: number;
  batchCostRate: number;
  quantity: number;
  sellingRate: number; // custom price set for this customer!
  lineTotal: number;
  lineCost: number;
  lineProfit: number;
}

export default function BillingView({
  products,
  batches,
  customers,
  brands,
  selectedInitialBatchId,
  selectedInitialCustomerId,
  onInvoiceCreated,
  onOpenNewCustomerModal,
  onOpenNewBatchModal,
  onOpenNewBrandModal,
}: BillingViewProps) {
  // Customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    selectedInitialCustomerId || customers[0]?.id || ""
  );

  useEffect(() => {
    if (selectedInitialCustomerId) {
      setSelectedCustomerId(selectedInitialCustomerId);
    } else if (customers.length > 0) {
      const exists = customers.some((c) => c.id === selectedCustomerId);
      if (!exists) {
        setSelectedCustomerId(customers[0].id);
      }
    } else {
      setSelectedCustomerId("");
    }
  }, [selectedInitialCustomerId, customers, selectedCustomerId]);

  // Cart builder states
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(10);
  const [customSellingRate, setCustomSellingRate] = useState<number>(0);

  // Invoice parameters
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE">("UPI");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle initial batch selection if passed
  useEffect(() => {
    if (selectedInitialBatchId) {
      const b = batches.find((x) => x.id === selectedInitialBatchId);
      if (b) {
        setSelectedProductId(b.productId);
        setSelectedBatchId(b.id);
        const p = products.find((x) => x.id === b.productId);
        setCustomSellingRate(p?.defaultSellRate || b.purchaseRate + 30);
      }
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [selectedInitialBatchId, products, batches, selectedProductId]);

  // When product changes, update available batches and default selling price
  useEffect(() => {
    if (selectedProductId) {
      const availableBatches = batches.filter(
        (b) => b.productId === selectedProductId && b.availableQuantity > 0
      );
      if (availableBatches.length > 0) {
        // default to first active batch (or FIFO: oldest purchase date)
        const sorted = [...availableBatches].sort(
          (a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
        );
        setSelectedBatchId(sorted[0].id);
        const prod = products.find((p) => p.id === selectedProductId);
        setCustomSellingRate(prod?.defaultSellRate || sorted[0].purchaseRate + 35);
      } else {
        setSelectedBatchId("");
      }
    }
  }, [selectedProductId, batches, products]);

  const activeCustomerId = selectedCustomerId || (customers.length > 0 ? customers[0].id : "");
  const selectedCustomer = customers.find((c) => c.id === activeCustomerId);
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const activeBatchesForProduct = batches.filter(
    (b) => b.productId === selectedProductId && b.availableQuantity > 0
  );
  const currentBatch = batches.find((b) => b.id === selectedBatchId);

  // Profit preview for single item currently being configured
  const currentCost = currentBatch?.purchaseRate || 0;
  const unitProfit = customSellingRate - currentCost;
  const totalItemProfit = unitProfit * quantity;

  // Add line to cart
  const handleAddToCart = () => {
    setErrorMessage("");
    if (!selectedProductId || !selectedBatchId || !currentBatch || !selectedProduct) {
      setErrorMessage("Please select a product and batch.");
      return;
    }
    if (quantity <= 0) {
      setErrorMessage("Quantity must be greater than 0.");
      return;
    }
    if (quantity > currentBatch.availableQuantity) {
      setErrorMessage(
        `Insufficient stock! Only ${currentBatch.availableQuantity} ${currentBatch.unit} available in batch ${currentBatch.batchNumber}.`
      );
      return;
    }
    if (customSellingRate <= 0) {
      setErrorMessage("Selling rate must be greater than 0.");
      return;
    }

    const lineTotal = quantity * customSellingRate;
    const lineCost = quantity * currentBatch.purchaseRate;
    const lineProfit = lineTotal - lineCost;

    const newItem: CartItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      brandName: selectedProduct.brandName || "Brand",
      batchId: currentBatch.id,
      batchNumber: currentBatch.batchNumber,
      batchPurchaseDate: currentBatch.purchaseDate,
      unit: selectedProduct.unit,
      availableStock: currentBatch.availableQuantity,
      batchCostRate: currentBatch.purchaseRate,
      quantity,
      sellingRate: customSellingRate,
      lineTotal,
      lineCost,
      lineProfit,
    };

    setCart([...cart, newItem]);
    setQuantity(10);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.lineTotal, 0);
  const totalCost = cart.reduce((acc, item) => acc + item.lineCost, 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const taxAmount = Number(((discountedSubtotal * taxRate) / 100).toFixed(2));
  const grandTotal = discountedSubtotal + taxAmount;
  const totalProfit = discountedSubtotal - totalCost;

  // Auto-sync paid amount when grand total changes, if user hasn't modified it to partial
  useEffect(() => {
    setPaidAmount(grandTotal);
  }, [grandTotal]);

  const balanceDue = Math.max(0, grandTotal - paidAmount);

  // Submit invoice
  const handleCreateInvoice = async () => {
    setErrorMessage("");
    const customerIdToUse = activeCustomerId;
    if (!customerIdToUse) {
      setErrorMessage("Please select or register a customer.");
      return;
    }
    if (cart.length === 0) {
      setErrorMessage("Add at least one item to the invoice.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerIdToUse,
          items: cart.map((c) => ({
            productId: c.productId,
            batchId: c.batchId,
            quantity: c.quantity,
            sellingRate: c.sellingRate,
          })),
          discount,
          taxRate,
          paidAmount,
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create invoice");
      }

      // Success! Clear cart and invoke callback
      setCart([]);
      setDiscount(0);
      setNotes("");
      onInvoiceCreated(data.invoice);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error creating invoice";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Customer Selection & Profile Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Select Customer / Client</span>
              <button
                type="button"
                onClick={onOpenNewCustomerModal}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                + Add New Customer
              </button>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={activeCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-slate-900"
              >
                {customers.length === 0 ? (
                  <option value="">-- No Customers Registered --</option>
                ) : (
                  customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.customerType}) - Phone: {c.phone || "N/A"}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Customer Summary Details */}
          {selectedCustomer && (
            <div className="flex items-center space-x-6 text-xs bg-slate-50 border border-slate-100 p-3 rounded-lg">
              <div>
                <span className="text-slate-400 block text-[10px]">Customer Type:</span>
                <span className="font-bold text-slate-800">{selectedCustomer.customerType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Location:</span>
                <span className="font-semibold text-slate-700">{selectedCustomer.city || "Local"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Outstanding Credit:</span>
                <span
                  className={`font-bold ${
                    selectedCustomer.creditBalance > 0 ? "text-rose-600 font-bold" : "text-emerald-600"
                  }`}
                >
                  ₹{selectedCustomer.creditBalance.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Builder & Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Item & Batch Configurator */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Add Product & Batch to Bill</h3>
          </div>

          {/* 1. Select Product & Brand */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Select Brand & Product *
              </label>
              {onOpenNewBrandModal && (
                <button
                  type="button"
                  onClick={onOpenNewBrandModal}
                  className="text-amber-600 hover:text-amber-700 font-semibold text-[11px] flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Brand</span>
                </button>
              )}
            </div>

            {products.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center justify-between">
                <span>No brands registered yet.</span>
                {onOpenNewBrandModal && (
                  <button
                    type="button"
                    onClick={onOpenNewBrandModal}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold"
                  >
                    + Add Brand
                  </button>
                )}
              </div>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 text-slate-900"
              >
                {products.map((p) => {
                  const stock = batches
                    .filter((b) => b.productId === p.id && b.availableQuantity > 0)
                    .reduce((acc, b) => acc + b.availableQuantity, 0);

                  return (
                    <option key={p.id} value={p.id}>
                      🏷️ Brand: {p.brandName || "Brand"} — {p.name} ({p.unit}) {stock > 0 ? `• [${stock} ${p.unit} in stock]` : `• [0 Stock]`}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* 2. Select Batch (with live cost and stock indicator) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Select Inward Batch *
              </label>
              <span className="text-[10px] text-amber-600 font-semibold">
                {activeBatchesForProduct.length} Batches in Stock
              </span>
            </div>

            {activeBatchesForProduct.length === 0 ? (
              <div className="p-3 bg-amber-50 text-amber-900 rounded-lg text-xs border border-amber-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    No active stock available for <strong>{selectedProduct?.brandName || "this brand"}</strong>.
                  </span>
                </div>
                {onOpenNewBatchModal && (
                  <button
                    type="button"
                    onClick={onOpenNewBatchModal}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inward Batch for {selectedProduct?.brandName || "Brand"}</span>
                  </button>
                )}
              </div>
            ) : (
              <select
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  const b = batches.find((x) => x.id === e.target.value);
                  if (b) {
                    setCustomSellingRate(b.purchaseRate + 35);
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 text-slate-900"
              >
                {activeBatchesForProduct.map((b) => (
                  <option key={b.id} value={b.id}>
                    Batch: {b.batchNumber} (Pur: {b.purchaseDate}) | Cost: ₹{b.purchaseRate} | Left: {b.availableQuantity} {b.unit}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3. Quantity & Custom Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity ({selectedProduct?.unit || "Units"})
              </label>
              <input
                type="number"
                min="1"
                max={currentBatch?.availableQuantity || 9999}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Rate / {selectedProduct?.unit || "Unit"} (₹)
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={customSellingRate}
                onChange={(e) => setCustomSellingRate(Number(e.target.value))}
                className="w-full p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-900"
              />
            </div>
          </div>

          {/* Differential Pricing Live Profit Indicator */}
          {currentBatch && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Batch Purchase Cost:</span>
                <span className="font-semibold text-slate-700">₹{currentBatch.purchaseRate}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Custom Selling Rate:</span>
                <span className="font-bold text-slate-900">₹{customSellingRate}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800">Real-Time Line Profit:</span>
                <span
                  className={`font-bold ${
                    unitProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {unitProfit >= 0 ? "+" : ""}₹{totalItemProfit.toFixed(2)} ({unitProfit >= 0 ? "+" : ""}
                  ₹{unitProfit}/unit)
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!currentBatch || currentBatch.availableQuantity <= 0}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item to Invoice</span>
          </button>
        </div>

        {/* Right Column: Invoice Cart & Financial Summary */}
        <div className="lg:col-span-2 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Invoice Items Cart ({cart.length} items)
                </h3>
              </div>
              {cart.length > 0 && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Estimated Profit: +₹{totalProfit.toFixed(2)}
                </span>
              )}
            </div>

            {/* Cart Table */}
            {cart.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                No items added yet. Select a product, batch, and set your customer selling price on the left to begin billing.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                      <th className="py-2 px-3">Item & Brand</th>
                      <th className="py-2 px-3">Batch & Cost</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Selling Rate</th>
                      <th className="py-2 px-3 text-right">Line Total</th>
                      <th className="py-2 px-3 text-right">Profit</th>
                      <th className="py-2 px-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900">{item.brandName}</span>
                          <span className="text-[11px] text-slate-500 block">{item.productName}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-slate-700">{item.batchNumber}</span>
                          <span className="text-[10px] text-slate-400 block">Cost: ₹{item.batchCostRate}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                          ₹{item.sellingRate}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                          ₹{item.lineTotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                          +₹{item.lineProfit.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bill Financials & Payment Configuration */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Options */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        GST Tax Rate (%)
                      </label>
                      <select
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium"
                      >
                        <option value={0}>0% (Exempt / Inclusive)</option>
                        <option value={18}>18% (Standard Cement & Granite)</option>
                        <option value={28}>28% (Luxury Tiles & Sanitary)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Amount Paid (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={grandTotal}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium"
                      >
                        <option value="UPI">UPI / QR Code</option>
                        <option value="CASH">Cash</option>
                        <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Invoice Remarks / Delivery Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Delivered to site via Auto / Lorry AP 16 TX 4920"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                    />
                  </div>
                </div>

                {/* Totals Summary Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>GST ({taxRate}%):</span>
                      <span>+₹{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-base text-slate-900">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Paid Amount:</span>
                    <span className="font-bold">₹{paidAmount.toFixed(2)}</span>
                  </div>
                  {balanceDue > 0 ? (
                    <div className="flex justify-between text-rose-600 font-bold bg-rose-50 p-1.5 rounded">
                      <span>Pending Balance (Credit):</span>
                      <span>₹{balanceDue.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                      <span>Payment Status:</span>
                      <span>PAID IN FULL</span>
                    </div>
                  )}

                  {/* Profit realized summary */}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-amber-800 font-bold">
                    <span>Net Profit Earned:</span>
                    <span>+₹{totalProfit.toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateInvoice}
                    disabled={isSubmitting}
                    className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{isSubmitting ? "Generating Bill..." : "Create Invoice & Print / Download PDF"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
