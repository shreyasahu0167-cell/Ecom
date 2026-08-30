# Saanvya | Modern Indian Couture E-Commerce Platform

A luxury Indian couture e-commerce application crafted in React, TypeScript, Tailwind CSS, and Supabase. Built strictly adhering to the Stitch visual design system and clean architectural principles.

---

## 🎨 Aesthetic & Design Language
- **Typography:** Display & Headlines in **EB Garamond**, Body & Specs in **Hanken Grotesk**.
- **Color Palette:**
  - **Ivory Foundation:** `#FBFAF5` (Warm parchment base)
  - **Primary Charcoal:** `#3D352E` & `#27201a`
  - **Antique Gold Accent:** `#BFA36C`
  - **Deep Rose Accent:** `#9E6F6D`
  - **Champagne Tint:** `#F6F3F0`
- **Edges & Structure:** Crisp 0px architectural borders, fluid editorial grid, tonal layering, and subtle micro-animations.

---

## 🔒 Security & Architectural Rules Enforced
1. **Zero Fake Brand Claims or Statistics:** All unverified story narratives, craftsmanship statements, store locations, alteration policies, and shipping terms use neutral, clearly marked demo-safe placeholder copy until official brand verification.
2. **Strict Demo vs Production Isolation:**
   - **Demo Mode:** Active when Supabase credentials are not supplied. Clearly displays a top banner and runs against local sample couture data.
   - **Production Mode:** Active when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided. Never silently falls back to demo data on database errors.
3. **Database & Order Integrity:**
   - Real UUID primary keys (`gen_random_uuid()`) generated in Postgres.
   - Atomic server-side order creation RPC (`create_order_secure`) that locks variant rows (`FOR UPDATE`), re-verifies pricing from the database, checks stock availability, decrements stock atomically, and computes INR totals.
4. **Currency:** Exclusively denominated in **Indian Rupees (INR ₹)**.
5. **Role-Based Row Level Security (RLS):** Supabase RLS enforces public read on active catalog items, customer-only access to their own orders, and admin-only management.
6. **Payment & Shipping Scaffolds:** Architecture prepared for Razorpay/Cashfree and carrier APIs without fabricating fake payment completions.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Deploying the Supabase Database Schema
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Copy and run the entire script in [`supabase/schema.sql`](file:///d:/Shreya/Saanvya%20Store/website/supabase/schema.sql).
4. Create an `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
5. Restart `npm run dev`. The top banner will automatically indicate: `Connected to Live Supabase Production Database`.

---

## 📂 Project Structure
```
website/
├── public/
├── src/
│   ├── components/
│   │   ├── common/         # ProductCard, CartDrawer, DemoBanner
│   │   └── layout/         # Navbar, Footer
│   ├── context/            # CartContext, AuthContext
│   ├── data/               # Demo sample products, collections, policies
│   ├── lib/                # Supabase client initializer
│   ├── pages/              # Home, Shop, Collections, ProductDetail, CartCheckout, OrderConfirmation, Story, VisitStore, Support, Auth, Admin
│   ├── services/           # Product, Order (RPC), Appointment services
│   ├── types/              # TypeScript definitions
│   ├── utils/              # INR & Date formatters
│   ├── App.tsx             # Main router and layout
│   ├── index.css           # Tailwind design tokens & typography
│   └── main.tsx            # App entrypoint
├── supabase/
│   └── schema.sql          # Postgres schema, RLS policies, create_order_secure RPC
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.ts
```
