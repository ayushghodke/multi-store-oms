# Multi-Store Order Management System (M-OMS) 🚀

A production-ready, full-stack web application for scalable multi-storefront order management. Built on a modern, serverless-first architecture deployed entirely on Vercel.

## 🌟 Features

### Task 1: CRUD & Infrastructure ✅
- Full CRUD for **Stores** and **Orders** with related **Order Items**
- **Pagination** on the Orders list with server-side skip/take logic
- **Database Indexes** on `store_id`, `created_at`, and `order_id` for fast lookups
- **Zod validation** on all API inputs
- **React Query** for client-side state, caching, and background sync
- **Prisma Transaction** for atomic Order + OrderItems creation

### Task 2: Real-Time Notifications ✅
- **Supabase Realtime** subscription to the `orders` table via `useRealtimeOrders` hook
- **`sonner` toast notifications** fire instantly when a new order is INSERTed
- React Query cache is invalidated on both INSERT and UPDATE events
- Works across tabs — create an order in one tab, see notifications in another

### Task 3: Data Archival & Analytics ✅
- **Archive API** (`POST /api/admin/archive`): Moves completed orders older than 30 days to `order_archive` in a single Prisma transaction, snapshotting `order_items` as JSON before cascade deletion
- **Enhanced Analytics** (`GET /api/analytics`):
  - Orders per day (last 30 days)
  - Revenue per store breakdown
  - Top 5 selling products via raw SQL aggregation
  - Count of orders eligible for archival
- **Admin Dashboard** (`/admin`): Visual analytics page with archive control panel

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Next.js 16 (App Router) |
| Styling | Tailwind CSS v4, Shadcn UI |
| State | TanStack React Query v5 |
| Realtime | Supabase Realtime (WebSockets) |
| Validation | Zod, React Hook Form |
| Backend | Next.js API Routes (Serverless) |
| ORM | Prisma v7 (`@prisma/adapter-pg`) |
| Database | Supabase (PostgreSQL 15) |
| Deployment | Vercel |

## 📐 Architecture

```
client/
├── src/app/
│   ├── page.tsx              # Orders Dashboard (with Realtime)
│   ├── admin/page.tsx        # Admin: Analytics + Archival
│   ├── stores/page.tsx       # Store management
│   ├── orders/new/page.tsx   # Create new order
│   └── api/
│       ├── stores/           # GET, POST /api/stores
│       ├── orders/           # GET (paginated), POST /api/orders
│       │   └── [id]/status/  # PATCH /api/orders/:id/status
│       ├── analytics/        # GET /api/analytics
│       └── admin/archive/    # POST /api/admin/archive
├── src/hooks/
│   └── useRealtimeOrders.ts  # Supabase Realtime hook
├── src/lib/
│   ├── db.ts                 # Prisma Singleton (pooled connection)
│   ├── supabase.ts           # Supabase browser client
│   └── schemas.ts            # Shared Zod schemas
└── prisma/schema.prisma      # Database schema with indexes
```

## 🚀 Local Setup

1. Clone the repository: `git clone ...`
2. Navigate to `client/`: `cd client`
3. Install dependencies: `npm install`
4. Create `client/.env.local`:
```ini
DATABASE_URL="postgresql://postgres.<ID>:<PWD>@pooler.supabase.com:6543/postgres?pgbouncer=true"
NEXT_PUBLIC_SUPABASE_URL="https://<ID>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
```
5. Push DB schema: `npx prisma db push`
6. Enable Supabase Realtime (one-time):
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```
7. Start dev server: `npm run dev`

## 🔐 Environment Variables (Vercel)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase **Transaction Pooler** string (port 6543) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key (safe to expose) |

---
*Built with ❤️ on the bleeding edge of Serverless JavaScript Architecture.*
