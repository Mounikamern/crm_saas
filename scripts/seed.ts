import { PrismaClient } from "@prisma/client";
import {
  initialStoreSetting,
  initialCategories,
  initialBrands,
  initialProducts,
  initialBatches,
  initialCustomers,
  initialInvoices,
  initialSuppliers,
} from "../src/lib/initial-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting PostgreSQL database seeding for Cements, Tiles & Granite CRM...");

  // 1. Store Setting
  await prisma.storeSetting.upsert({
    where: { id: initialStoreSetting.id },
    update: initialStoreSetting,
    create: initialStoreSetting,
  });
  console.log("✓ Store Settings seeded");

  // 2. Categories
  for (const cat of initialCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }
  console.log(`✓ ${initialCategories.length} Categories seeded`);

  // 3. Brands
  for (const brand of initialBrands) {
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: brand,
      create: brand,
    });
  }
  console.log(`✓ ${initialBrands.length} Brands seeded`);

  // 4. Products
  for (const prod of initialProducts) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        sku: prod.sku,
        hsnCode: prod.hsnCode,
        unit: prod.unit,
        categoryId: prod.categoryId,
        brandId: prod.brandId,
        defaultCostRate: prod.defaultCostRate,
        defaultSellRate: prod.defaultSellRate,
        minStockAlert: prod.minStockAlert,
      },
      create: {
        id: prod.id,
        name: prod.name,
        sku: prod.sku,
        hsnCode: prod.hsnCode,
        unit: prod.unit,
        categoryId: prod.categoryId,
        brandId: prod.brandId,
        defaultCostRate: prod.defaultCostRate,
        defaultSellRate: prod.defaultSellRate,
        minStockAlert: prod.minStockAlert,
      },
    });
  }
  console.log(`✓ ${initialProducts.length} Products seeded`);

  // 5. Suppliers
  for (const sup of initialSuppliers) {
    await prisma.supplier.upsert({
      where: { id: sup.id },
      update: sup,
      create: sup,
    });
  }
  console.log(`✓ ${initialSuppliers.length} Suppliers seeded`);

  // 6. Batches (User's Ramco 1/10/2026, 10/10/2026, Sagar 1/10/2026, 10/10/2026, Tiles, Granite)
  for (const b of initialBatches) {
    await prisma.batch.upsert({
      where: { id: b.id },
      update: {
        batchNumber: b.batchNumber,
        productId: b.productId,
        purchaseDate: new Date(b.purchaseDate),
        purchaseRate: b.purchaseRate,
        initialQuantity: b.initialQuantity,
        soldQuantity: b.soldQuantity,
        availableQuantity: b.availableQuantity,
        status: b.status,
        supplierName: b.supplierName,
        notes: b.notes,
      },
      create: {
        id: b.id,
        batchNumber: b.batchNumber,
        productId: b.productId,
        purchaseDate: new Date(b.purchaseDate),
        purchaseRate: b.purchaseRate,
        initialQuantity: b.initialQuantity,
        soldQuantity: b.soldQuantity,
        availableQuantity: b.availableQuantity,
        status: b.status,
        supplierName: b.supplierName,
        notes: b.notes,
      },
    });
  }
  console.log(`✓ ${initialBatches.length} Batches seeded`);

  // 7. Customers
  for (const cust of initialCustomers) {
    await prisma.customer.upsert({
      where: { id: cust.id },
      update: {
        name: cust.name,
        phone: cust.phone,
        email: cust.email,
        address: cust.address,
        city: cust.city,
        gstin: cust.gstin,
        customerType: cust.customerType,
        totalBilled: cust.totalBilled,
        totalPaid: cust.totalPaid,
        creditBalance: cust.creditBalance,
      },
      create: {
        id: cust.id,
        name: cust.name,
        phone: cust.phone,
        email: cust.email,
        address: cust.address,
        city: cust.city,
        gstin: cust.gstin,
        customerType: cust.customerType,
        totalBilled: cust.totalBilled,
        totalPaid: cust.totalPaid,
        creditBalance: cust.creditBalance,
      },
    });
  }
  console.log(`✓ ${initialCustomers.length} Customers seeded`);

  // 8. Invoices & Items
  for (const inv of initialInvoices) {
    await prisma.saleInvoice.upsert({
      where: { id: inv.id },
      update: {
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: new Date(inv.invoiceDate),
        customerId: inv.customerId,
        customerName: inv.customerName,
        subtotal: inv.subtotal,
        discount: inv.discount,
        taxRate: inv.taxRate,
        taxAmount: inv.taxAmount,
        grandTotal: inv.grandTotal,
        paidAmount: inv.paidAmount,
        balanceDue: inv.balanceDue,
        paymentStatus: inv.paymentStatus,
        paymentMethod: inv.paymentMethod,
        totalCost: inv.totalCost,
        totalProfit: inv.totalProfit,
        profitMargin: inv.profitMargin,
        notes: inv.notes,
      },
      create: {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: new Date(inv.invoiceDate),
        customerId: inv.customerId,
        customerName: inv.customerName,
        subtotal: inv.subtotal,
        discount: inv.discount,
        taxRate: inv.taxRate,
        taxAmount: inv.taxAmount,
        grandTotal: inv.grandTotal,
        paidAmount: inv.paidAmount,
        balanceDue: inv.balanceDue,
        paymentStatus: inv.paymentStatus,
        paymentMethod: inv.paymentMethod,
        totalCost: inv.totalCost,
        totalProfit: inv.totalProfit,
        profitMargin: inv.profitMargin,
        notes: inv.notes,
      },
    });

    for (const item of inv.items) {
      await prisma.saleInvoiceItem.upsert({
        where: { id: item.id },
        update: {
          invoiceId: item.invoiceId,
          productId: item.productId,
          batchId: item.batchId,
          productName: item.productName,
          brandName: item.brandName,
          batchNumber: item.batchNumber,
          batchPurchaseDate: new Date(item.batchPurchaseDate),
          unit: item.unit,
          quantity: item.quantity,
          batchCostRate: item.batchCostRate,
          sellingRate: item.sellingRate,
          lineTotal: item.lineTotal,
          lineCost: item.lineCost,
          lineProfit: item.lineProfit,
        },
        create: {
          id: item.id,
          invoiceId: item.invoiceId,
          productId: item.productId,
          batchId: item.batchId,
          productName: item.productName,
          brandName: item.brandName,
          batchNumber: item.batchNumber,
          batchPurchaseDate: new Date(item.batchPurchaseDate),
          unit: item.unit,
          quantity: item.quantity,
          batchCostRate: item.batchCostRate,
          sellingRate: item.sellingRate,
          lineTotal: item.lineTotal,
          lineCost: item.lineCost,
          lineProfit: item.lineProfit,
        },
      });
    }
  }
  console.log(`✓ ${initialInvoices.length} Invoices & line items seeded`);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
