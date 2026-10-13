import fs from "fs";
import path from "path";
import {
  StoreSetting,
  DealerStore,
  Category,
  Brand,
  Product,
  Batch,
  Customer,
  SaleInvoice,
  Supplier,
  BatchProfitSummary,
  DashboardStats,
  SubscriptionPlan,
  DealerSubscription,
} from "./types";
import {
  initialStoreSetting,
  initialCategories,
  initialBrands,
  initialProducts,
  initialBatches,
  initialCustomers,
  initialInvoices,
  initialSuppliers,
  initialSubscriptionPlans,
  initialSubscriptions,
  initialExpiredDealer,
} from "./initial-data";
import { prisma, isPostgresConnected } from "./prisma";

export function isSubscriptionExpired(sub: DealerSubscription | null | undefined): boolean {
  if (!sub) return true;
  if (sub.status === "EXPIRED" || sub.status === "CANCELLED") return true;
  if (sub.endDate && new Date(sub.endDate).getTime() < Date.now()) return true;
  return false;
}

interface StoreData {
  settings: StoreSetting;
  dealers: DealerStore[];
  activeDealerId: string;
  subscriptions: DealerSubscription[];
  categories: Category[];
  brands: Brand[];
  products: Product[];
  batches: Batch[];
  customers: Customer[];
  invoices: SaleInvoice[];
  suppliers: Supplier[];
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const DATA_FILE = path.join(DATA_DIR, "db-store.json");

// Ensure store directory and file exist
function getStoreData(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const initialData: StoreData = {
    settings: initialStoreSetting,
    dealers: [initialStoreSetting],
    activeDealerId: initialStoreSetting.id,
    subscriptions: initialSubscriptions,
    categories: initialCategories,
    brands: initialBrands,
    products: initialProducts,
    batches: initialBatches,
    customers: initialCustomers,
    invoices: initialInvoices,
    suppliers: initialSuppliers,
  };

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (!parsed.dealers || parsed.dealers.length === 0) {
      parsed.dealers = [parsed.settings || initialStoreSetting, initialExpiredDealer];
      parsed.activeDealerId = parsed.settings?.id || initialStoreSetting.id;
    } else if (!parsed.dealers.some((d: DealerStore) => d.id === initialExpiredDealer.id)) {
      parsed.dealers.push(initialExpiredDealer);
    }
    if (!parsed.subscriptions) {
      parsed.subscriptions = initialSubscriptions;
    } else {
      for (const sub of initialSubscriptions) {
        if (!parsed.subscriptions.some((s: DealerSubscription) => s.id === sub.id)) {
          parsed.subscriptions.push(sub);
        }
      }
    }
    return parsed;
  } catch (err) {
    console.error("Error reading JSON store, initializing default:", err);
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}

function saveStoreData(data: StoreData) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const dbService = {
  // Check if PostgreSQL is connected
  async checkPostgres(): Promise<boolean> {
    return await isPostgresConnected();
  },

  // DEALERS & MULTI-TENANCY
  async getDealers(): Promise<{ dealers: DealerStore[]; activeDealerId: string }> {
    const store = getStoreData();
    return {
      dealers: store.dealers || [store.settings],
      activeDealerId: store.activeDealerId || store.settings.id,
    };
  },

  async registerDealer(data: {
    storeName: string;
    dealerType?: string;
    ownerName: string;
    phone: string;
    email?: string;
    gstin?: string;
    address: string;
    city: string;
    state?: string;
    pincode?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    invoicePrefix?: string;
    brandsHandled?: string[];
  }): Promise<DealerStore> {
    const store = getStoreData();
    const id = "dealer_" + Date.now();
    const prefix = data.invoicePrefix?.trim() || `INV-${data.storeName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase()}-`;

    const newDealer: DealerStore = {
      id,
      storeName: data.storeName.trim(),
      dealerType: data.dealerType || "Wholesale Cement Dealer",
      ownerName: data.ownerName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || "",
      gstin: data.gstin?.trim() || "",
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state?.trim() || "Andhra Pradesh",
      pincode: data.pincode?.trim() || "",
      bankName: data.bankName?.trim() || "",
      accountNumber: data.accountNumber?.trim() || "",
      ifscCode: data.ifscCode?.trim() || "",
      upiId: data.upiId?.trim() || "",
      invoicePrefix: prefix,
      invoiceTerms: initialStoreSetting.invoiceTerms,
      brandsHandled: data.brandsHandled || ["Ramco Cement", "Sagar Cement", "Ultratech Cement"],
      createdAt: new Date().toISOString(),
    };

    if (!store.dealers) store.dealers = [store.settings];
    store.dealers.push(newDealer);
    store.settings = newDealer;
    store.activeDealerId = newDealer.id;
    saveStoreData(store);
    return newDealer;
  },

  async switchDealer(dealerId: string): Promise<DealerStore> {
    const store = getStoreData();
    const found = store.dealers?.find((d) => d.id === dealerId);
    if (!found) throw new Error("Dealer not found");
    store.settings = found;
    store.activeDealerId = found.id;
    saveStoreData(store);
    return found;
  },

  // STORE SETTINGS
  async getSettings(): Promise<StoreSetting> {
    const isPg = await isPostgresConnected();
    if (isPg) {
      try {
        const row = await prisma.storeSetting.findFirst();
        if (row) return row as unknown as StoreSetting;
      } catch (e) {
        console.warn("Postgres query failed, falling back to local store:", e);
      }
    }
    const store = getStoreData();
    return store.settings;
  },

  async updateSettings(updates: Partial<StoreSetting>): Promise<StoreSetting> {
    const isPg = await isPostgresConnected();
    if (isPg) {
      try {
        const existing = await prisma.storeSetting.findFirst();
        if (existing) {
          const updated = await prisma.storeSetting.update({
            where: { id: existing.id },
            data: updates,
          });
          return updated as unknown as StoreSetting;
        }
      } catch (e) {
        console.warn("Postgres update failed, updating local store:", e);
      }
    }
    const store = getStoreData();
    store.settings = { ...store.settings, ...updates };
    // update in dealers array as well
    if (store.dealers) {
      const idx = store.dealers.findIndex((d) => d.id === store.settings.id);
      if (idx !== -1) {
        store.dealers[idx] = store.settings;
      }
    }
    saveStoreData(store);
    return store.settings;
  },

  // CUSTOMER PAYMENT RECORDING
  async recordCustomerPayment(data: {
    customerId: string;
    amount: number;
    paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
    notes?: string;
  }): Promise<Customer> {
    const store = getStoreData();
    const customer = store.customers.find((c) => c.id === data.customerId);
    if (!customer) throw new Error("Customer not found");

    customer.totalPaid += data.amount;
    customer.creditBalance = Math.max(0, customer.totalBilled - customer.totalPaid);
    saveStoreData(store);
    return customer;
  },

  // CATEGORIES & BRANDS
  async getCategories(): Promise<Category[]> {
    const store = getStoreData();
    return store.categories;
  },

  async getBrands(): Promise<Brand[]> {
    const store = getStoreData();
    return store.brands;
  },

  async createBrand(data: { name: string; category?: string }): Promise<Brand> {
    const store = getStoreData();
    const activeId = store.activeDealerId || store.settings?.id || "store_main";
    const exists = store.brands.find((b) => b.name.toLowerCase() === data.name.trim().toLowerCase());

    const cat = data.category || (exists ? exists.category : "Cement") || "Cement";
    const unit = cat === "Tiles" ? "Boxes" : cat === "Granite" ? "Sq.Ft" : "Bags";
    const catId = cat === "Tiles" ? "cat_tiles" : cat === "Granite" ? "cat_granite" : "cat_cement";

    if (exists) {
      // Ensure product exists for existing brand
      const prodExists = store.products.find(
        (p) => p.brandId === exists.id || (p.brandName && p.brandName.toLowerCase() === exists.name.toLowerCase())
      );
      if (!prodExists) {
        const autoProd: Product = {
          id: "prod_" + exists.id,
          dealerId: activeId,
          name: `${exists.name} Standard (${unit})`,
          unit,
          categoryId: catId,
          categoryName: cat,
          brandId: exists.id,
          brandName: exists.name,
          defaultCostRate: 0,
          defaultSellRate: 0,
          minStockAlert: 20,
        };
        store.products.push(autoProd);
        saveStoreData(store);
      }
      return exists;
    }

    const newBrandId = "brand_" + Date.now();
    const newBrand: Brand = {
      id: newBrandId,
      dealerId: activeId,
      name: data.name.trim(),
      category: cat,
    };
    store.brands.push(newBrand);

    // Auto-create corresponding standard product so the brand is immediately visible in Inward Batch & Sales Bill
    const newProd: Product = {
      id: "prod_" + newBrandId,
      dealerId: activeId,
      name: `${newBrand.name} Standard (${unit})`,
      unit,
      categoryId: catId,
      categoryName: cat,
      brandId: newBrand.id,
      brandName: newBrand.name,
      defaultCostRate: 0,
      defaultSellRate: 0,
      minStockAlert: 20,
    };
    store.products.push(newProd);

    saveStoreData(store);
    return newBrand;
  },

  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const store = getStoreData();
    const activeId = store.activeDealerId || store.settings?.id || "store_main";

    // Auto-heal: Ensure every brand in store.brands has at least one associated product
    let storeUpdated = false;
    for (const b of store.brands) {
      const hasProd = store.products.some(
        (p) => p.brandId === b.id || (p.brandName && p.brandName.toLowerCase() === b.name.toLowerCase())
      );
      if (!hasProd) {
        const cat = b.category || "Cement";
        const unit = cat === "Tiles" ? "Boxes" : cat === "Granite" ? "Sq.Ft" : "Bags";
        const catId = cat === "Tiles" ? "cat_tiles" : cat === "Granite" ? "cat_granite" : "cat_cement";
        const autoProd: Product = {
          id: "prod_" + b.id,
          dealerId: activeId,
          name: `${b.name} Standard (${unit})`,
          unit,
          categoryId: catId,
          categoryName: cat,
          brandId: b.id,
          brandName: b.name,
          defaultCostRate: 0,
          defaultSellRate: 0,
          minStockAlert: 20,
        };
        store.products.push(autoProd);
        storeUpdated = true;
      }
    }
    if (storeUpdated) {
      saveStoreData(store);
    }

    return store.products.map((p) => {
      // enrich with live calculated total stock and active batches count for THIS dealer
      const activeBatches = store.batches.filter(
        (b) => (b.dealerId || "store_main") === activeId && b.productId === p.id && b.status === "ACTIVE"
      );
      const totalStock = activeBatches.reduce((acc, b) => acc + b.availableQuantity, 0);
      return {
        ...p,
        totalStock,
        activeBatchesCount: activeBatches.length,
      };
    });
  },

  async createProduct(prod: Omit<Product, "id">): Promise<Product> {
    const store = getStoreData();
    const activeId = store.activeDealerId || store.settings?.id || "store_main";
    const id = "prod_" + Date.now();
    const category = store.categories.find((c) => c.id === prod.categoryId);
    const brand = store.brands.find((b) => b.id === prod.brandId);

    const newProd: Product = {
      ...prod,
      id,
      dealerId: activeId,
      categoryName: category?.name || prod.categoryName,
      brandName: brand?.name || prod.brandName,
    };
    store.products.push(newProd);
    saveStoreData(store);
    return newProd;
  },

  // BATCHES
  async getBatches(filter?: { productId?: string; brandName?: string; status?: string }): Promise<Batch[]> {
    const store = getStoreData();
    const activeId = store.activeDealerId || store.settings?.id || "store_main";
    let batches = store.batches.filter((b) => (b.dealerId || "store_main") === activeId);

    if (filter?.productId) {
      batches = batches.filter((b) => b.productId === filter.productId);
    }
    if (filter?.brandName) {
      batches = batches.filter((b) => b.brandName?.toLowerCase() === filter.brandName?.toLowerCase());
    }
    if (filter?.status) {
      batches = batches.filter((b) => b.status === filter.status);
    }

    // Sort by purchaseDate descending (newest first)
    return batches.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  },

  async getBatchById(id: string): Promise<Batch | null> {
    const store = getStoreData();
    return store.batches.find((b) => b.id === id) || null;
  },

  // Create new inward stock batch (e.g. 1/10/2026 Ramco 200 bags @ 230, Sagar 300 bags @ 300)
  async createBatch(data: {
    productId: string;
    batchNumber?: string;
    purchaseDate: string;
    purchaseRate: number;
    initialQuantity: number;
    supplierName?: string;
    notes?: string;
  }): Promise<Batch> {
    const store = getStoreData();
    const activeId = store.activeDealerId || store.settings?.id || "store_main";
    const product = store.products.find((p) => p.id === data.productId);
    if (!product) throw new Error("Product not found");

    const batchNumber =
      data.batchNumber?.trim() ||
      `${product.brandName?.toUpperCase().replace(/\s+/g, "").slice(0, 5)}-BAT-${data.purchaseDate.replace(/-/g, "").slice(2)}`;

    const id = "batch_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const totalPurchaseCost = data.initialQuantity * data.purchaseRate;

    const newBatch: Batch = {
      id,
      dealerId: activeId,
      batchNumber,
      productId: data.productId,
      productName: product.name,
      brandName: product.brandName,
      unit: product.unit,
      purchaseDate: data.purchaseDate,
      purchaseRate: data.purchaseRate,
      initialQuantity: data.initialQuantity,
      soldQuantity: 0,
      availableQuantity: data.initialQuantity,
      status: "ACTIVE",
      supplierName: data.supplierName || "Direct Factory / Depot",
      notes: data.notes || "",
      totalPurchaseCost,
      stockValueRemaining: totalPurchaseCost,
      totalRevenueRealized: 0,
      totalProfitRealized: 0,
      profitMarginPercent: 0,
    };

    store.batches.push(newBatch);
    saveStoreData(store);
    return newBatch;
  },

  // CUSTOMERS
  async getCustomers(): Promise<Customer[]> {
    const store = getStoreData();
    const activeId = store.activeDealerId || store.settings?.id || "store_main";
    return store.customers
      .filter((c) => (c.dealerId || "store_main") === activeId)
      .sort((a, b) => b.totalBilled - a.totalBilled);
  },

  async createCustomer(cust: Omit<Customer, "id" | "totalBilled" | "totalPaid" | "creditBalance" | "createdAt">): Promise<Customer> {
    const store = getStoreData();
    const activeId = store.activeDealerId || store.settings?.id || "store_main";
    const newCust: Customer = {
      ...cust,
      id: "cust_" + Date.now(),
      dealerId: activeId,
      totalBilled: 0,
      totalPaid: 0,
      creditBalance: 0,
      createdAt: new Date().toISOString(),
    };
    store.customers.push(newCust);
    saveStoreData(store);
    return newCust;
  },

  async deleteCustomer(id: string): Promise<boolean> {
    const isPg = await isPostgresConnected();
    if (isPg) {
      try {
        await prisma.customer.delete({ where: { id } });
      } catch (e) {
        console.warn("Postgres customer delete error:", e);
      }
    }
    const store = getStoreData();
    const initialLen = store.customers.length;
    store.customers = store.customers.filter((c) => c.id !== id);
    saveStoreData(store);
    return store.customers.length < initialLen;
  },

  // INVOICES & SALES
  async getInvoices(): Promise<SaleInvoice[]> {
    const store = getStoreData();
    const activeId = store.activeDealerId || store.settings?.id || "store_main";
    return store.invoices
      .filter((inv) => (inv.dealerId || "store_main") === activeId)
      .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  },

  async getInvoiceById(id: string): Promise<SaleInvoice | null> {
    const store = getStoreData();
    return store.invoices.find((inv) => inv.id === id) || null;
  },

  // CREATE SALE INVOICE (With batch deduction and differential custom pricing per customer)
  async createSaleInvoice(payload: {
    customerId: string;
    invoiceDate?: string;
    items: {
      productId: string;
      batchId: string;
      quantity: number;
      sellingRate: number; // custom price set for this customer!
    }[];
    discount?: number;
    taxRate?: number;
    paidAmount?: number;
    paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
    notes?: string;
  }): Promise<SaleInvoice> {
    const store = getStoreData();

    const customer = store.customers.find((c) => c.id === payload.customerId);
    if (!customer) throw new Error("Customer not found");

    if (!payload.items || payload.items.length === 0) {
      throw new Error("Invoice must contain at least one item");
    }

    const invoiceDate = payload.invoiceDate || new Date().toISOString().split("T")[0];
    const invoiceNumber = `${store.settings.invoicePrefix}${String(store.invoices.length + 1).padStart(4, "0")}`;
    const invoiceId = "inv_" + Date.now();

    let subtotal = 0;
    let totalCost = 0;
    const invoiceItems: SaleInvoice["items"] = [];

    // Process each item and deduct from corresponding batch
    for (let i = 0; i < payload.items.length; i++) {
      const line = payload.items[i];
      const batch = store.batches.find((b) => b.id === line.batchId);
      if (!batch) {
        throw new Error(`Batch ID ${line.batchId} not found`);
      }

      if (batch.availableQuantity < line.quantity) {
        throw new Error(
          `Insufficient stock in batch ${batch.batchNumber} (${batch.productName}). Available: ${batch.availableQuantity}, Requested: ${line.quantity}`
        );
      }

      const product = store.products.find((p) => p.id === line.productId);
      const lineTotal = line.quantity * line.sellingRate;
      const lineCost = line.quantity * batch.purchaseRate;
      const lineProfit = lineTotal - lineCost;

      subtotal += lineTotal;
      totalCost += lineCost;

      // Update Batch stock & realized profit metrics
      batch.soldQuantity += line.quantity;
      batch.availableQuantity = batch.initialQuantity - batch.soldQuantity;
      if (batch.availableQuantity <= 0) {
        batch.status = "DEPLETED";
      }
      batch.stockValueRemaining = batch.availableQuantity * batch.purchaseRate;
      batch.totalRevenueRealized += lineTotal;
      batch.totalProfitRealized += lineProfit;
      if (batch.soldQuantity > 0) {
        const soldCost = batch.soldQuantity * batch.purchaseRate;
        batch.profitMarginPercent = Number(((batch.totalProfitRealized / soldCost) * 100).toFixed(2));
      }

      invoiceItems.push({
        id: `item_${invoiceId}_${i + 1}`,
        invoiceId,
        productId: line.productId,
        batchId: line.batchId,
        productName: product?.name || batch.productName || "Product",
        brandName: product?.brandName || batch.brandName || "Brand",
        batchNumber: batch.batchNumber,
        batchPurchaseDate: batch.purchaseDate,
        unit: product?.unit || batch.unit || "Units",
        quantity: line.quantity,
        batchCostRate: batch.purchaseRate,
        sellingRate: line.sellingRate,
        lineTotal,
        lineCost,
        lineProfit,
      });
    }

    const discount = payload.discount || 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const taxRate = payload.taxRate || 0;
    const taxAmount = Number(((discountedSubtotal * taxRate) / 100).toFixed(2));
    const grandTotal = discountedSubtotal + taxAmount;

    const paidAmount = payload.paidAmount !== undefined ? payload.paidAmount : grandTotal;
    const balanceDue = Math.max(0, grandTotal - paidAmount);

    let paymentStatus: "PAID" | "PARTIALLY_PAID" | "CREDIT" = "PAID";
    if (paidAmount <= 0) {
      paymentStatus = "CREDIT";
    } else if (paidAmount < grandTotal) {
      paymentStatus = "PARTIALLY_PAID";
    }

    const totalProfit = discountedSubtotal - totalCost;
    const profitMargin = totalCost > 0 ? Number(((totalProfit / totalCost) * 100).toFixed(2)) : 0;

    const activeId = store.activeDealerId || store.settings?.id || "store_main";
    const newInvoice: SaleInvoice = {
      id: invoiceId,
      dealerId: activeId,
      invoiceNumber,
      invoiceDate,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      customerGstin: customer.gstin,
      subtotal,
      discount,
      taxRate,
      taxAmount,
      grandTotal,
      paidAmount,
      balanceDue,
      paymentStatus,
      paymentMethod: payload.paymentMethod,
      totalCost,
      totalProfit,
      profitMargin,
      notes: payload.notes || "",
      items: invoiceItems,
      createdAt: new Date().toISOString(),
    };

    // Update customer financial record
    customer.totalBilled += grandTotal;
    customer.totalPaid += paidAmount;
    customer.creditBalance += balanceDue;

    store.invoices.push(newInvoice);
    saveStoreData(store);
    return newInvoice;
  },

  // BATCH-WISE DETAILED PROFIT ANALYTICS
  // "how much bags sold in 1/10/2026 batch, how much stock left and how much profit he earns"
  async getBatchProfitSummaries(): Promise<BatchProfitSummary[]> {
    const store = getStoreData();
    const activeId = store.activeDealerId || store.settings?.id || "store_main";
    const dealerBatches = store.batches.filter((b) => (b.dealerId || "store_main") === activeId);
    const dealerInvoices = store.invoices.filter((inv) => (inv.dealerId || "store_main") === activeId);

    return dealerBatches.map((batch) => {
      // Find all invoice items sold from this batch
      const salesFromBatch = dealerInvoices.flatMap((inv) =>
        inv.items.filter((item) => item.batchId === batch.id)
      );

      const totalRevenue =
        salesFromBatch.length > 0
          ? salesFromBatch.reduce((sum, item) => sum + item.lineTotal, 0)
          : batch.totalRevenueRealized || 0;
      const totalCostOfSold = batch.soldQuantity * batch.purchaseRate;
      const netProfit =
        salesFromBatch.length > 0
          ? totalRevenue - totalCostOfSold
          : batch.totalProfitRealized || 0;
      const profitMarginPercent = totalCostOfSold > 0 ? Number(((netProfit / totalCostOfSold) * 100).toFixed(2)) : 0;

      return {
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        productName: batch.productName || "Product",
        brandName: batch.brandName || "Brand",
        unit: batch.unit || "Bags",
        purchaseDate: batch.purchaseDate,
        purchaseRate: batch.purchaseRate,
        initialQuantity: batch.initialQuantity,
        soldQuantity: batch.soldQuantity,
        availableQuantity: batch.availableQuantity,
        totalPurchaseCost: batch.initialQuantity * batch.purchaseRate,
        totalRevenue,
        totalCostOfSold,
        netProfit,
        profitMarginPercent,
        remainingStockValue: batch.availableQuantity * batch.purchaseRate,
        salesCount: salesFromBatch.length,
      };
    });
  },

  // DASHBOARD STATS
  async getDashboardStats(): Promise<DashboardStats> {
    const store = getStoreData();
    const activeId = store.activeDealerId || store.settings?.id || "store_main";
    const dealerBatches = store.batches.filter((b) => (b.dealerId || "store_main") === activeId);
    const dealerInvoices = store.invoices.filter((inv) => (inv.dealerId || "store_main") === activeId);
    const dealerCustomers = store.customers.filter((c) => (c.dealerId || "store_main") === activeId);

    const totalRevenue = dealerInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalProfit = dealerInvoices.reduce((sum, inv) => sum + inv.totalProfit, 0);
    const totalCost = dealerInvoices.reduce((sum, inv) => sum + inv.totalCost, 0);
    const grossMarginPercent = totalCost > 0 ? Number(((totalProfit / totalCost) * 100).toFixed(2)) : 0;

    const totalStockValue = dealerBatches
      .filter((b) => b.status === "ACTIVE")
      .reduce((sum, b) => sum + b.availableQuantity * b.purchaseRate, 0);

    const totalReceivables = dealerCustomers.reduce((sum, c) => sum + c.creditBalance, 0);

    const activeBatches = dealerBatches.filter((b) => b.status === "ACTIVE");
    const lowStockBatches = activeBatches.filter((b) => b.availableQuantity <= 50);

    // Group by Brand
    const brandMap: Record<
      string,
      { brandName: string; categoryName: string; totalStockBags: number; unit: string; totalRevenue: number; totalProfit: number }
    > = {};

    for (const b of dealerBatches) {
      const key = b.brandName || "Other";
      if (!brandMap[key]) {
        brandMap[key] = {
          brandName: key,
          categoryName: b.unit === "Bags" ? "Cement" : b.unit === "Boxes" ? "Tiles" : "Granite",
          totalStockBags: 0,
          unit: b.unit || "Bags",
          totalRevenue: 0,
          totalProfit: 0,
        };
      }
      brandMap[key].totalStockBags += b.availableQuantity;
      brandMap[key].totalRevenue += b.totalRevenueRealized || 0;
      brandMap[key].totalProfit += b.totalProfitRealized || 0;
    }

    const brandSummaries = Object.values(brandMap);

    return {
      totalRevenue,
      totalProfit,
      grossMarginPercent,
      totalStockValue,
      totalReceivables,
      totalActiveBatches: activeBatches.length,
      lowStockBatchesCount: lowStockBatches.length,
      brandSummaries,
      recentInvoices: dealerInvoices.slice(-5).reverse(),
      recentBatches: dealerBatches.slice(-5).reverse(),
    };
  },

  // SUPPLIERS
  async getSuppliers(): Promise<Supplier[]> {
    const store = getStoreData();
    return store.suppliers;
  },

  // SUBSCRIPTIONS & RAZORPAY INTEGRATION
  getSubscriptionPlans(): SubscriptionPlan[] {
    return initialSubscriptionPlans;
  },

  async getSubscriptions(): Promise<DealerSubscription[]> {
    const store = getStoreData();
    return store.subscriptions || initialSubscriptions;
  },

  async getSubscriptionByMobile(mobile: string): Promise<DealerSubscription | null> {
    const store = getStoreData();
    const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10);
    const sub = (store.subscriptions || []).find((s) => {
      const subDigits = s.dealerMobile.replace(/[^0-9]/g, "").slice(-10);
      return subDigits === cleanMobile;
    });
    return sub || null;
  },

  async createSubscription(data: {
    dealerMobile: string;
    dealerStoreName: string;
    ownerName: string;
    planId: string;
    billingCycle?: "monthly" | "yearly";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  }): Promise<{ subscription: DealerSubscription; dealer: DealerStore }> {
    const store = getStoreData();
    const plan =
      initialSubscriptionPlans.find((p) => p.id === data.planId) ||
      initialSubscriptionPlans[1];
    const cycle = data.billingCycle || "yearly";
    const amount = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

    const startDate = new Date();
    const endDate = new Date();
    if (cycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subId = "sub_" + Date.now();
    const subscription: DealerSubscription = {
      id: subId,
      dealerMobile: data.dealerMobile.trim(),
      dealerStoreName: data.dealerStoreName.trim(),
      ownerName: data.ownerName.trim(),
      planId: plan.id,
      planName: plan.name,
      billingCycle: cycle,
      amount,
      currency: "INR",
      razorpayOrderId: data.razorpayOrderId || `order_rzp_${Date.now()}`,
      razorpayPaymentId: data.razorpayPaymentId || `pay_rzp_${Date.now()}`,
      status: "ACTIVE",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!store.subscriptions) store.subscriptions = [...initialSubscriptions];
    // Filter out previous sub for same mobile number
    const targetDigits = data.dealerMobile.replace(/[^0-9]/g, "").slice(-10);
    store.subscriptions = store.subscriptions.filter(
      (s) => s.dealerMobile.replace(/[^0-9]/g, "").slice(-10) !== targetDigits
    );
    store.subscriptions.push(subscription);

    // Save updated subscriptions
    saveStoreData(store);

    // Also register or link dealer store
    let dealer = (store.dealers || []).find(
      (d) => d.phone.replace(/[^0-9]/g, "").slice(-10) === targetDigits
    );

    if (!dealer) {
      dealer = await this.registerDealer({
        storeName: data.dealerStoreName,
        ownerName: data.ownerName,
        phone: data.dealerMobile,
        address: "Industrial Bypass & Depot Area",
        city: "Vijayawada",
      });
    } else {
      await this.switchDealer(dealer.id);
    }

    return { subscription, dealer };
  },
};
