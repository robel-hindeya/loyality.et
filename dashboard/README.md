# 💳 LoyaltyPass - Modern Digital Loyalty Card Platform

A production-grade, full-stack **Digital Loyalty Card & Rewards Platform** built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL + Auth + Row Level Security)**.

---

## 🌟 Concept & Core Architecture

1. **Companies**: Business owners register, configure their store profile, and create customized loyalty programs (e.g., *"Buy 6 services, get 1 free"*).
2. **Customers**: Users register, receive an instant digital loyalty pass card and a permanent unique QR code (`LC-XXXX-XXXX`).
3. **Cashiers**: Counter staff use the **Cashier Scanner Terminal** with live camera QR detection (or manual code entry) to verify customers, add **+1 visit stamp** in 1 second, and redeem unlocked free rewards with celebratory confetti.
4. **Automated Rewards**: When a customer's stamps reach the program requirement (e.g. 6 stamps), their digital pass alerts them that their free reward is unlocked and ready to claim at checkout.

---

## 📁 Scalable Folder Structure

```text
dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Sign in with role-based redirects
│   │   └── register/page.tsx            # Merchant & Customer sign up
│   ├── dashboard/
│   │   ├── company/
│   │   │   ├── page.tsx                 # Company overview & KPI metrics
│   │   │   ├── programs/
│   │   │   │   ├── page.tsx             # Loyalty programs list
│   │   │   │   ├── new/page.tsx         # Live program creator & theme preview
│   │   │   │   └── [id]/edit/page.tsx   # Program settings editor
│   │   │   ├── cashiers/page.tsx        # Staff authorization & accounts
│   │   │   ├── customers/page.tsx       # Customer directory & stamp tracking
│   │   │   └── analytics/page.tsx       # 7-day visit chart & redemption rates
│   │   ├── cashier/
│   │   │   ├── page.tsx                 # High-speed QR scanner, +1 stamp, & reward redeem
│   │   │   └── history/page.tsx         # Cashier shift scan audit logs
│   │   └── user/
│   │       ├── page.tsx                 # Digital wallet, punch cards & personal QR
│   │       ├── history/page.tsx         # Customer visit & stamp audit trail
│   │       └── rewards/page.tsx         # Redeemed vouchers & claim history
│   ├── api/
│   │   ├── loyalty/
│   │   │   ├── scan/route.ts            # QR verification API endpoint
│   │   │   ├── stamp/route.ts           # Visit stamping API endpoint
│   │   │   └── redeem/route.ts          # Reward redemption API endpoint
│   │   └── auth/callback/route.ts       # Supabase OAuth/email callback
│   ├── globals.css                      # Tailwind styling & animations
│   ├── layout.tsx                       # Root layout with responsive navbar
│   └── page.tsx                         # High-converting landing page & live demo
├── components/
│   ├── layout/
│   │   └── Navbar.tsx                   # Responsive navigation & role switcher
│   ├── loyalty/
│   │   └── LoyaltyCardVisual.tsx        # Flagship interactive punch card component
│   ├── qr/
│   │   ├── QrCodeDisplay.tsx            # High-res QR renderer & fullscreen mode
│   │   └── QrScannerModal.tsx           # Camera stream & manual code input
│   └── ui/
│       └── ConfigNotice.tsx             # Supabase setup instructions helper
├── database/
│   ├── schema.sql                       # Full PostgreSQL schema with RLS & triggers
│   └── seed.sql                         # Initial test data
├── hooks/
│   └── use-auth.ts                      # React hook for session, profile & role
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser-side Supabase client
│   │   ├── server.ts                    # Server-side Supabase SSR client
│   │   ├── middleware.ts                # Session cookie refresher & RBAC
│   │   └── config.ts                    # Supabase environment validation
│   └── utils.ts                         # Classname merger (cn), tokens & date formatting
├── services/
│   ├── auth.service.ts                  # Sign in, sign up, role management
│   ├── cashier.service.ts               # Verification, +1 stamps, reward redemption
│   ├── company.service.ts               # Program builder, analytics & staff roster
│   └── user.service.ts                  # Customer wallet, history & enrollment
├── types/
│   └── index.ts                         # Strict TypeScript domain models
├── middleware.ts                        # Route protection & role enforcement
├── .env.example                         # Environment variables template
└── next.config.mjs                      # Next.js configuration
```

---

## ⚡ Quick Start & Setup

### 1. Configure Supabase Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your project credentials from your [Supabase Dashboard](https://app.supabase.com) (`Project Settings -> API`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Apply Database Schema
Go to **Supabase Studio -> SQL Editor**, copy the contents of [`database/schema.sql`](file:///home/robel/Documents/wallet-platform/dashboard/database/schema.sql), and click **Run**.

This sets up:
- `profiles` table (with role-based access: `company`, `cashier`, `user`)
- `companies` table (with branding, category, and metadata)
- `loyalty_programs` table (stamps target, reward description, colors, icons)
- `loyalty_cards` table (user's progress, lifetime visits, reward eligibility)
- `stamp_logs` table (complete visit timestamps, cashier attribution)
- `reward_redemptions` table (voucher codes, spent stamps)
- Row Level Security (RLS) policies protecting company and user records
- Automated trigger on `auth.users` to provision profiles with unique QR tokens.

*(Optional)* Run [`database/seed.sql`](file:///home/robel/Documents/wallet-platform/dashboard/database/seed.sql) to populate sample test data.

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Role-Based Access Control (RBAC)

| Role | Access Permissions | Landing URL |
| :--- | :--- | :--- |
| **`company`** | Full access to Company Dashboard, program creation, cashier management, customer directory, analytics, and cashier scanner. | `/dashboard/company` |
| **`cashier`** | Access to Checkout Scanner terminal, customer QR verification, +1 visit stamp action, reward redemption, and shift history. | `/dashboard/cashier` |
| **`user`** | Access to personal digital wallet, punch cards, full-screen QR pass, visit history, and available program discovery. | `/dashboard/user` |

All routes are protected server-side via [`middleware.ts`](file:///home/robel/Documents/wallet-platform/dashboard/middleware.ts).

---

## 🚀 Features Highlights

- **Real Camera QR Scanner**: Scans mobile screens in sub-second time with manual code fallback (`LC-XXXX-XXXX`) for counter convenience.
- **Physical-to-Digital Punch Card**: Tactile card rendering with stamped animations, checkmarks, progress bars, and reward indicators.
- **Instant Stamping & Rewards**: Single-click visit recording; auto-calculates unlocked free rewards.
- **Celebratory Redemptions**: Validated voucher generation with `canvas-confetti` fireworks upon reward claim.
- **Analytics & Retention**: 7-day visit volume bar charts, redemption percentage, and live cashier activity stream.
