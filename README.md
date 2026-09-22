# 🏗️ HomeBuild Tracker — Smart Home Construction Expense & Progress Management

A complete, production-ready, full-featured web application designed for homeowners to manage the complete financial and operational history of their house construction from groundbreaking to housewarming.

Built with **React 19 + Vite**, **Tailwind CSS**, **Recharts**, **Lucide Icons**, and **Supabase** (PostgreSQL + RLS + Storage + Auth).

---

## 🌟 Key Features

### 1. 📊 Executive Dashboard & Real-Time Analytics
* **Financial KPIs**: Total Budget, Total Spent, Remaining Funds, Pending Payments, and Variance.
* **Interactive Charts**: Monthly cashflow area charts, category-wise expenditure breakdown (materials vs labour vs contractors vs permits), and stage-wise progress vs spending.
* **Smart Alert Cards**: Low material stock threshold alerts, budget overspend warnings, and upcoming contractor milestones.
* **Quick Action Bar**: 1-click modals for adding expenses, material purchases, labour attendance, contractor payments, and site diary logs.

### 2. 💰 Complete Expense & Budget Management
* **Unit Cost Calculator**: Auto-calculates `Total = Quantity × Unit Rate` or supports flat lump-sum entries.
* **Payment Mode Tracking**: Cash, UPI / GPay / PhonePe, Bank Transfer (NEFT/RTGS/IMPS), Cheque, Credit Card.
* **Category & Subcategory Breakdown**: Materials (Cement, Steel, Sand, Bricks, Tiles, Paint, Plumbing, Electrical), Labour, Contractor, Machinery, Permits, Architect/Interior.
* **Budget Allocator**: Set stage or category-wise budget caps with real-time progress bars, percentage spent, and variance indicators.

### 3. 📦 Material Inventory & Stock Control
* **Stock In & Stock Out Tracking**: Real-time stock balance calculated from total purchased minus used on site.
* **Auto-Costing**: Calculates average unit price across multiple purchase batches.
* **Low Stock Warning Badges**: Automatic flags when inventory dips below safety reorder levels.
* **Direct Stock Consumption Modal**: Log material consumption directly linked to specific construction stages.

### 4. 👷 Labour, Attendance & Wages
* **Worker & Gang Management**: Daily wage, weekly contract, or piece-rate masons, helpers, bar benders, carpenters, and electricians.
* **Daily Attendance Register**: Present, Half-Day, Absent tracking with overtime hours calculator.
* **Auto-Wage Calculation**: `Daily Wage × Days Worked + Overtime Rate × OT Hours`.
* **Advance & Balance Settling**: Track wage advances given and net payouts due during weekly/monthly settlement.

### 5. 🤝 Contractors & Milestone Payments
* **Contractor Profiles**: Civil contractor, electrical, plumbing, painting, fabrication, interior carpentry.
* **Agreement & Scope Tracking**: Total contract value, payment milestones, scope of work, and retention money terms.
* **Milestone Payment Schedule**: Link payments to stage verification (e.g., "15% on Plinth Beam completion", "25% on First Slab casting").
* **Payment Status Badges**: Pending, Partial, Paid, and Overdue with transaction reference IDs.

### 6. 🏗️ 21 Pre-Built Construction Stages & Site Diary
* **Standard Indian Construction Stages**: Land & Soil Testing, Excavation, PCC, Footing, Plinth Beam, Column Casting, Brickwork, Lintels, RCC Slab Casting, Electrical/Plumbing Concealed, Plastering, Waterproofing, Flooring, Doors/Windows, Painting, Elevation, and Final Handover.
* **Site Daily Diary**: Weather conditions, work completed today, planned for tomorrow, workers present, issues/delays, and site supervisor notes.
* **Inspection Checklists**: Pre-slab casting checklists, curing logs, and quality inspection checkpoints.

### 7. 📸 Media Gallery & Document Vault
* **Stage-Tagged Photo Album**: Upload site progress photos tagged by stage, date, and description.
* **Before/After Comparisons**: Track visual transformation over time.
* **Document Management**: Store land registry papers (7/12, Sale Deed), municipal sanction plans, structural drawings, tax receipts, and warranty cards.
* **Receipt & Invoice Attachments**: Attach PDF or image invoices to any expense or material record.

### 8. 🏦 Funding, Home Loans & Disbursals
* **Multi-Source Funding**: Track personal savings, family contributions, and Bank Home Loans.
* **Loan Disbursal Milestones**: Track bank sanction amount, tranche disbursals linked to engineer inspection stages, and remaining loan balance.

### 9. 📑 Export & Reporting Suite
* **Excel (.xlsx) Export**: Full multi-sheet construction expense register with summary statistics.
* **CSV Export**: Standard CSV data dump for accounting software.
* **Printable PDF Reports**: Formatted executive report with project header, financial breakdown, category totals, and signatures.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite |
| **Styling & UI** | Tailwind CSS + Lucide React Icons |
| **Charts & Visualizations** | Recharts (Area, Bar, Pie, Cell) |
| **Notifications & Dialogs** | SweetAlert2 |
| **Data Exports** | SheetJS (`xlsx`) + `jspdf` + `jspdf-autotable` |
| **Date & Time** | `date-fns` |
| **Backend & Database** | Supabase (PostgreSQL with Row Level Security) |
| **Storage Engine** | Supabase Storage (Buckets: `construction-photos`, `construction-receipts`, `construction-documents`) |
| **Authentication** | Supabase Auth (Email/Password) + 1-Click Offline Demo Mode |
| **Hosting & Deployment** | Vercel (SPA-configured via `vercel.json`) |

---

## 🚀 Getting Started Locally

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn

### 1. Clone & Install Dependencies
```bash
# Navigate to the project directory
cd "HomeBuild-Tracker"

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root folder by copying `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Note**: If you don't supply Supabase credentials immediately, the application seamlessly runs in **Interactive Demo Mode** with realistic pre-populated data and full localStorage persistence.

### 3. Setup Supabase Database
1. Go to your [Supabase Dashboard](https://app.supabase.com).
2. Create a new project.
3. Open the **SQL Editor** tab from the left sidebar.
4. Open the [`supabase_schema.sql`](./supabase_schema.sql) file included in this repository.
5. Copy and paste the entire SQL script into the Supabase SQL editor and click **Run**.
6. The script automatically sets up:
   * All 24 relational tables with constraints and foreign keys.
   * Row-Level Security (RLS) policies granting users isolated access to their own projects and data.
   * Auto-updating timestamps via PostgreSQL triggers.
   * Pre-seeded default expense categories and construction stages.
   * Configured storage buckets for photos, receipts, and documents.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your repository.
4. Under **Environment Variables**, add:
   * `VITE_SUPABASE_URL`: Your Supabase Project URL
   * `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon/Public Key
5. Click **Deploy**.

> The included [`vercel.json`](./vercel.json) file automatically handles single-page app (SPA) routing rewrites so all React Router links work without 404s on page refresh.

---

## 📂 Project Structure

```
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/             # AmountDisplay, DataTable, StatusBadge, ProgressBar, etc.
│   │   ├── layout/             # Sidebar, TopHeader, MobileNav, AppLayout
│   │   └── modals/             # Modals for Expense, Material, Labour, Contractor, Diary, etc.
│   ├── constants/              # Categories, 21 Stages, Units of measurement
│   ├── contexts/               # AuthContext, ProjectContext, ThemeContext, NotificationContext
│   ├── pages/
│   │   ├── auth/               # Login, Register, ForgotPassword
│   │   ├── construction/       # ConstructionStages, ConstructionProgress, DailyDiary
│   │   ├── dashboard/          # Executive Analytics Dashboard
│   │   ├── expenses/           # ExpenseList, BudgetManagement
│   │   ├── funding/            # FundingLoans
│   │   ├── materials/          # MaterialStock, Suppliers
│   │   ├── media/              # PhotosGallery, DocumentsList
│   │   ├── payments/           # PaymentList
│   │   ├── people/             # Workers, LabourAttendance, Contractors
│   │   ├── projects/           # ProjectList & Project creation
│   │   ├── reports/            # Export & Summary reports
│   │   ├── settings/           # Profile, Currency & System settings
│   │   └── tasks/              # Site Tasks & Milestones
│   ├── routes/                 # AppRoutes.jsx
│   ├── services/               # dataService.js, supabaseClient.js, mockData.js, exportService.js
│   ├── utils/                  # currency.js (INR ₹), date.js, validators.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase_schema.sql         # Complete 24-table Supabase DB schema + RLS + Storage
├── vercel.json                 # Vercel SPA routing rewrite config
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🇮🇳 Currency & Measurement Standards
* **Currency**: Standard Indian Rupee (`₹`) formatted according to the Indian numbering system (e.g., `₹25,00,000` for 25 Lakhs / `₹1.5 Cr`).
* **Units**: Bags (Cement), MT / Tons / Kg (Steel), Brass / CFT (Sand & Aggregates), Thousands / Pcs (Bricks), Sq.Ft / Sq.M (Flooring & Plaster), Litres (Paint), Numbers / Sets (Fixtures), RFT (Plumbing/Wiring).

---

## 📄 License
MIT License. Built for homeowners and construction project managers.
