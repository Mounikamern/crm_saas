export interface DealerStore {
  id: string;
  storeName: string;
  tagline?: string;
  dealerType: string; // "Wholesale Cement Dealer", "Tiles & Granite Mart", etc.
  ownerName: string;
  phone: string;
  email?: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  invoicePrefix: string;
  invoiceTerms?: string;
  brandsHandled?: string[];
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface DealerSubscription {
  id: string;
  dealerMobile: string;
  dealerStoreName: string;
  ownerName: string;
  planId: string;
  planName: string;
  billingCycle: "monthly" | "yearly";
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface StoreSetting extends DealerStore {}

export interface Category {
  id: string;
  name: string;
  unit: string; // Bags, Boxes, Sq.Ft, Slabs
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  category?: string;
  dealerId?: string;
}

export interface Product {
  id: string;
  dealerId?: string;
  name: string;
  sku?: string;
  hsnCode?: string;
  unit: string;
  categoryId: string;
  categoryName?: string;
  brandId: string;
  brandName?: string;
  defaultCostRate: number;
  defaultSellRate: number;
  minStockAlert: number;
  totalStock?: number;
  activeBatchesCount?: number;
}

export interface Batch {
  id: string;
  dealerId?: string;
  batchNumber: string;
  productId: string;
  productName?: string;
  brandName?: string;
  unit?: string;
  purchaseBillId?: string;
  purchaseDate: string; // ISO date string e.g. "2026-10-01"
  purchaseRate: number; // Cost per bag/unit
  initialQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  status: "ACTIVE" | "DEPLETED";
  supplierName?: string;
  notes?: string;
  totalPurchaseCost: number; // initialQuantity * purchaseRate
  stockValueRemaining: number; // availableQuantity * purchaseRate
  totalRevenueRealized: number; // sum of sales from this batch
  totalProfitRealized: number; // totalRevenueRealized - (soldQuantity * purchaseRate)
  profitMarginPercent: number;
}

export interface Customer {
  id: string;
  dealerId?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  gstin?: string;
  customerType: "CONTRACTOR" | "BUILDER" | "RETAIL" | "WHOLESALE";
  totalBilled: number;
  totalPaid: number;
  creditBalance: number;
  createdAt: string;
}

export interface SaleInvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  batchId: string;
  productName: string;
  brandName: string;
  batchNumber: string;
  batchPurchaseDate: string;
  unit: string;
  quantity: number;
  batchCostRate: number; // cost price from batch
  sellingRate: number; // custom dealer selling price for this customer
  lineTotal: number; // quantity * sellingRate
  lineCost: number; // quantity * batchCostRate
  lineProfit: number; // lineTotal - lineCost
}

export interface SaleInvoice {
  id: string;
  dealerId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGstin?: string;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: "PAID" | "PARTIALLY_PAID" | "CREDIT";
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  notes?: string;
  items: SaleInvoiceItem[];
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
}

export interface BatchProfitSummary {
  batchId: string;
  batchNumber: string;
  productName: string;
  brandName: string;
  unit: string;
  purchaseDate: string;
  purchaseRate: number;
  initialQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  totalPurchaseCost: number;
  totalRevenue: number;
  totalCostOfSold: number;
  netProfit: number;
  profitMarginPercent: number;
  remainingStockValue: number;
  salesCount: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalProfit: number;
  grossMarginPercent: number;
  totalStockValue: number;
  totalReceivables: number;
  totalActiveBatches: number;
  lowStockBatchesCount: number;
  brandSummaries: {
    brandName: string;
    categoryName: string;
    totalStockBags: number;
    unit: string;
    totalRevenue: number;
    totalProfit: number;
  }[];
  recentInvoices: SaleInvoice[];
  recentBatches: Batch[];
}
