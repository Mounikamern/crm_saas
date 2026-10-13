# BuildCraft CRM SaaS 🏗️

A specialized CRM & ERP SaaS application designed specifically for **Cement Dealers, Tile Showrooms, and Granite & Marble Stores**. Built from scratch using **Next.js (App Router), Tailwind CSS, TypeScript, and PostgreSQL with Prisma ORM**.

---

## 🌟 Key Features

### 1. Brand-Wise & Batch-Wise Stock Maintenance
* **Multiple Consignments / Batches on Different Dates**:
  * Track stocks by **Brand** (Ramco Cement, Sagar Cement, Ultratech, Kajaria, Black Pearl Granite) and **Purchase Date / Batch**.
  * Complete visibility into **Initial Bags Bought**, **Cost Price (Purchase Rate)**, **Bags Sold from each batch**, and **Remaining Stock**.
  * Pre-loaded with your exact scenarios:
    * **01/10/2026**:
      * *Ramco Cement*: 200 bags bought @ ₹230/bag &rarr; **150 sold**, **50 left in stock**, **₹5,700 profit earned**.
      * *Sagar Cement*: 300 bags bought @ ₹300/bag &rarr; **180 sold**, **120 left in stock**, **₹8,100 profit earned**.
    * **10/10/2026**:
      * *Ramco Cement*: 200 bags bought @ ₹250/bag &rarr; **40 sold**, **160 left in stock**, **₹1,800 profit earned**.
      * *Sagar Cement*: 300 bags bought @ ₹350/bag &rarr; **0 sold**, **300 left in stock (Full Consignment intact)**.

### 2. Flexible Customer Pricing (Differential Rates)
* In building materials, dealers sell at different prices to different customers:
  * **Contractors / Bulk**: e.g., Ramco Cement sold @ ₹265/bag
  * **Commercial Builders**: e.g., Sagar Cement sold @ ₹345/bag
  * **Retail / Individual Homeowners**: e.g., Ramco Cement sold @ ₹280/bag or ₹295/bag
* Custom selling rate per item on every bill with **real-time line profit & margin preview** (`Selling Rate - Batch Cost Rate`).

### 3. Real-Time Batch Profit Tracking
* Dedicated **Batch Profit Analysis** screen answering:
  1. *How many bags were sold in the 01/10/2026 batch?*
  2. *How much stock is left in that batch?*
  3. *How much profit was earned on that batch?*
* Side-by-side comparison between 01/10/2026 and 10/10/2026 consignments.
* Detailed sales drill-down showing which customer purchased from that batch, at what differential rate, and the exact profit realized.

### 4. Professional Tax Invoice & PDF Download
* Single-click **"Download PDF"** generating clean, GST-ready vector invoices with:
  * Store details, GSTIN, Address, Contact
  * Bill To: Customer Name, Phone, Address, GSTIN
  * Line items with Brand, Product, Batch Number, Purchase Date reference, Quantity, Unit, Selling Rate, and Line Total
  * Subtotal, Discounts, GST Tax (0%, 18%, 28%), Grand Total, Amount Paid, and Balance Due (Credit)
  * Bank Details for NEFT/RTGS and UPI ID
  * Standard Terms & Conditions and Authorized Signatory
* Single-click **"Print Invoice"** with print-optimized CSS layout.

### 5. Multi-Category Inventory Support
* **Cements**: Tracked in **Bags** (50kg)
* **Tiles**: Tracked in **Boxes** (Vitrified, Ceramic, Digital)
* **Granite & Marble**: Tracked in **Sq.Ft** (18mm polished slabs, gangsaw cut)

### 6. Customer CRM & Credit Ledger
* Track outstanding balances, customer classification (Contractor, Builder, Retail, Wholesale), and lifetime purchases.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons
* **PDF Engine**: `jspdf` for client-side vector invoice rendering
* **Backend**: Next.js API Routes (`/api/batches`, `/api/products`, `/api/sales`, `/api/analytics`, `/api/customers`, `/api/settings`)
* **Database & ORM**: PostgreSQL with Prisma ORM
* **Dual Persistence Engine**: Built-in zero-config fallback (`src/data/db-store.json`) for instant out-of-the-box offline evaluation, plus automatic detection of live PostgreSQL!

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🐘 Connecting Your PostgreSQL Database

The application is pre-configured with Prisma ORM for PostgreSQL.

### Step 1: Set your connection string in `.env`
Open `.env` and set your PostgreSQL connection URL:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/crm_db?schema=public"
```
*(Compatible with local PostgreSQL, Supabase, Neon, or Railway)*

### Step 2: Push the schema to PostgreSQL
```bash
npm run db:push
```

### Step 3: (Optional) Seed the database with Ramco, Sagar, Tiles & Granite batches
```bash
npm run db:seed
```

---

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma        # Prisma PostgreSQL schema (Batches, Products, Invoices, Customers)
├── scripts/
│   └── seed.ts              # Seeding script for PostgreSQL
├── src/
│   ├── app/
│   │   ├── api/             # Backend API Routes
│   │   │   ├── analytics/   # Batch profit & dashboard stats
│   │   │   ├── batches/     # Batch inventory & inward stock
│   │   │   ├── customers/   # Customer ledger & credit management
│   │   │   ├── db-status/   # PostgreSQL connection diagnostic
│   │   │   ├── invoices/    # Single invoice retrieval
│   │   │   ├── products/    # Products & brand catalog
│   │   │   ├── sales/       # POS billing with batch deduction
│   │   │   └── settings/    # Store profile & invoice headers
│   │   ├── globals.css      # Tailwind CSS and print stylesheet
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main interactive dashboard & view router
│   ├── components/
│   │   ├── BatchProfitAnalyticsView.tsx  # Deep-dive batch profit reports
│   │   ├── BillingView.tsx               # POS invoice builder with custom customer rates
│   │   ├── CustomersView.tsx             # Customer directory & balances
│   │   ├── DashboardView.tsx             # Overview KPI metrics & recent invoices
│   │   ├── Header.tsx                    # Top navigation & quick actions
│   │   ├── InvoiceModal.tsx              # Printable invoice preview & PDF export
│   │   ├── InvoicesView.tsx              # Invoices ledger
│   │   ├── NewBatchModal.tsx             # Stock inward consignment modal
│   │   ├── NewCustomerModal.tsx          # New customer creation modal
│   │   ├── SettingsView.tsx              # Store settings & PostgreSQL connection manager
│   │   ├── Sidebar.tsx                   # Main navigation sidebar
│   │   └── StockBatchesView.tsx          # Brand-wise & batch-wise inventory
│   └── lib/
│       ├── db-service.ts     # Data service & batch profit calculation engine
│       ├── initial-data.ts   # Seed data for Ramco, Sagar, Tiles & Granite
│       ├── pdf-generator.ts  # jsPDF tax invoice generation utility
│       ├── prisma.ts         # Prisma client instance
│       └── types.ts          # TypeScript interfaces & data models
```
